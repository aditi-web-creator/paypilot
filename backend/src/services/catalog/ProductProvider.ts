import fs from 'fs';
import path from 'path';
import { Product } from '../../types/index.js';
import { env } from '../../config/env.js';

export interface ProductQueryOptions {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc' | 'relevance';
  page?: number;
  limit?: number;
}

export interface ProductQueryResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ComparisonMatrix {
  products: Product[];
  categories: string[];
  attributes: {
    key: string;
    label: string;
    values: { productId: string; value: string | number | boolean }[];
  }[];
}

export interface IProductProvider {
  getProducts(options?: ProductQueryOptions): Promise<ProductQueryResult>;
  getProductById(id: string): Promise<Product | null>;
  getProductByName(name: string): Promise<Product | null>;
  getCategories(): Promise<string[]>;
  getBrands(category?: string): Promise<string[]>;
  searchProducts(query: string, maxResults?: number): Promise<Product[]>;
  compareProducts(productIds: string[]): Promise<ComparisonMatrix>;
}

export class LocalProductProvider implements IProductProvider {
  private products: Product[] = [];
  private initialized: boolean = false;

  constructor() {
    this.loadCatalog();
  }

  private loadCatalog(): void {
    if (this.initialized) return;

    try {
      const candidates = [
        path.resolve(process.cwd(), 'database/products_catalog.json'),
        path.resolve(process.cwd(), '../database/products_catalog.json'),
        path.resolve(__dirname, '../../../../database/products_catalog.json'),
        path.resolve(__dirname, '../../../database/products_catalog.json'),
      ];

      let rawData: string | null = null;
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          rawData = fs.readFileSync(p, 'utf-8');
          break;
        }
      }

      if (rawData) {
        this.products = JSON.parse(rawData);
        this.initialized = true;
      } else {
        console.warn('Warning: products_catalog.json not found in candidate paths. Initializing with empty list.');
        this.products = [];
      }
    } catch (error) {
      console.error('Failed to load local product catalog:', error);
      this.products = [];
    }
  }

  public async getProducts(options: ProductQueryOptions = {}): Promise<ProductQueryResult> {
    this.loadCatalog();
    let filtered = [...this.products];

    // Filter by search query
    if (options.q && options.q.trim()) {
      const terms = options.q.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter(p => {
        const text = `${p.name} ${p.brand} ${p.category} ${p.description} ${JSON.stringify(p.specifications)}`.toLowerCase();
        return terms.every(term => text.includes(term));
      });
    }

    // Filter by category
    if (options.category && options.category.trim() && options.category.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === options.category!.toLowerCase());
    }

    // Filter by brand
    if (options.brand && options.brand.trim() && options.brand.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.brand.toLowerCase() === options.brand!.toLowerCase());
    }

    // Filter by price
    if (typeof options.minPrice === 'number' && !isNaN(options.minPrice)) {
      filtered = filtered.filter(p => p.price >= options.minPrice!);
    }
    if (typeof options.maxPrice === 'number' && !isNaN(options.maxPrice)) {
      filtered = filtered.filter(p => p.price <= options.maxPrice!);
    }

    // Sort
    const sort = options.sort || 'relevance';
    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_desc') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = filtered.length;
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 20);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getProductById(id: string): Promise<Product | null> {
    this.loadCatalog();
    const found = this.products.find(p => p.id === id);
    return found || null;
  }

  public async getProductByName(name: string): Promise<Product | null> {
    this.loadCatalog();
    const clean = name.toLowerCase().trim();
    // exact match first
    let found = this.products.find(p => p.name.toLowerCase() === clean);
    if (!found) {
      // fuzzy partial match
      found = this.products.find(p => p.name.toLowerCase().includes(clean) || clean.includes(p.name.toLowerCase()));
    }
    return found || null;
  }

  public async getCategories(): Promise<string[]> {
    this.loadCatalog();
    const set = new Set(this.products.map(p => p.category));
    return Array.from(set).sort();
  }

  public async getBrands(category?: string): Promise<string[]> {
    this.loadCatalog();
    let list = this.products;
    if (category && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    const set = new Set(list.map(p => p.brand));
    return Array.from(set).sort();
  }

  public async searchProducts(query: string, maxResults: number = 8): Promise<Product[]> {
    this.loadCatalog();
    if (!query || !query.trim()) return this.products.slice(0, maxResults);

    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/).filter(Boolean);

    // Score products based on match frequency in name, brand, specs, description
    const scored = this.products.map(product => {
      let score = 0;
      const name = product.name.toLowerCase();
      const brand = product.brand.toLowerCase();
      const cat = product.category.toLowerCase();
      const desc = product.description.toLowerCase();
      const specs = JSON.stringify(product.specifications).toLowerCase();

      for (const term of terms) {
        if (name.includes(term)) score += 10;
        if (brand.includes(term)) score += 8;
        if (cat.includes(term)) score += 6;
        if (specs.includes(term)) score += 4;
        if (desc.includes(term)) score += 2;
      }

      return { product, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.product);
  }

  public async compareProducts(productIds: string[]): Promise<ComparisonMatrix> {
    this.loadCatalog();
    const foundProducts = productIds
      .map(id => this.products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));

    if (foundProducts.length === 0) {
      return { products: [], categories: [], attributes: [] };
    }

    const categories = Array.from(new Set(foundProducts.map(p => p.category)));

    // Standard attributes
    const attributes: ComparisonMatrix['attributes'] = [
      {
        key: 'price',
        label: 'Price ($)',
        values: foundProducts.map(p => ({ productId: p.id, value: `$${p.price.toFixed(2)}` })),
      },
      {
        key: 'brand',
        label: 'Brand',
        values: foundProducts.map(p => ({ productId: p.id, value: p.brand })),
      },
      {
        key: 'rating',
        label: 'Customer Rating',
        values: foundProducts.map(p => ({ productId: p.id, value: `${p.rating} / 5.0` })),
      },
      {
        key: 'stock_status',
        label: 'Availability',
        values: foundProducts.map(p => ({
          productId: p.id,
          value: p.stock_status === 'in_stock' ? 'In Stock' : 'Low Stock',
        })),
      },
    ];

    // Collect all unique specification keys across comparing products
    const specKeys = new Set<string>();
    foundProducts.forEach(p => {
      Object.keys(p.specifications || {}).forEach(k => specKeys.add(k));
    });

    specKeys.forEach(key => {
      const formattedLabel = key
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      attributes.push({
        key,
        label: formattedLabel,
        values: foundProducts.map(p => ({
          productId: p.id,
          value: p.specifications?.[key] !== undefined ? String(p.specifications[key]) : 'N/A',
        })),
      });
    });

    return {
      products: foundProducts,
      categories,
      attributes,
    };
  }
}

// Singleton product provider instance
export const productProvider: IProductProvider = new LocalProductProvider();
