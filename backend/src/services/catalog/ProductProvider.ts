import { PrismaClient } from '@prisma/client';
import { Product } from '../../types/index.js';

const prisma = new PrismaClient();

export interface ProductQueryOptions {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStockOnly?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc' | 'newest' | 'relevance';
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
    bestProductId?: string;
    values: { productId: string; value: string | number | boolean; isBest?: boolean }[];
  }[];
}

export interface IProductProvider {
  getProducts(options?: ProductQueryOptions): Promise<ProductQueryResult>;
  getProductById(id: string): Promise<Product | null>;
  getProductByName(name: string): Promise<Product | null>;
  getCategories(): Promise<{ categories: string[]; subcategories: Record<string, string[]> }>;
  getCategoryList(): Promise<string[]>;
  getBrands(category?: string): Promise<string[]>;
  searchProducts(query: string, maxResults?: number): Promise<Product[]>;
  compareProducts(productIds: string[]): Promise<ComparisonMatrix>;
  getTotalCount(): Promise<number>;
}

function mapPrismaProduct(row: any): Product {
  let tags: string[] = [];
  try {
    tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [];
  } catch {
    tags = [];
  }

  let specs: Record<string, any> = {};
  try {
    specs = typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs || {};
  } catch {
    specs = {};
  }

  const stock = typeof row.stock === 'number' ? row.stock : 50;
  const stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' =
    stock === 0 ? 'out_of_stock' : stock <= 15 ? 'low_stock' : 'in_stock';

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    priceUSD: row.priceUSD,
    originalPriceUSD: row.originalPriceUSD || undefined,
    price: row.priceUSD, // alias
    currency: 'USD',
    rating: row.rating,
    reviewCount: row.reviewCount,
    stock,
    stock_status,
    imageUrl: row.imageUrl,
    image_url: row.imageUrl, // alias
    tags,
    specs,
    specifications: specs, // alias
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    created_at: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class DatabaseProductProvider implements IProductProvider {
  public async getTotalCount(): Promise<number> {
    return prisma.product.count();
  }

  public async getProducts(options: ProductQueryOptions = {}): Promise<ProductQueryResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    // 1. Category Filter
    if (options.category && options.category.trim() && options.category.toLowerCase() !== 'all') {
      where.category = { equals: options.category.trim() };
    }

    // 2. Subcategory Filter
    if (options.subcategory && options.subcategory.trim() && options.subcategory.toLowerCase() !== 'all') {
      where.subcategory = { equals: options.subcategory.trim() };
    }

    // 3. Brand Filter (supports single or multi-select array / comma-separated)
    if (options.brand) {
      let brandList: string[] = [];
      if (Array.isArray(options.brand)) {
        brandList = options.brand.map(b => b.trim()).filter(Boolean);
      } else if (typeof options.brand === 'string') {
        brandList = options.brand.split(',').map(b => b.trim()).filter(b => b && b.toLowerCase() !== 'all');
      }
      if (brandList.length === 1) {
        where.brand = { equals: brandList[0] };
      } else if (brandList.length > 1) {
        where.brand = { in: brandList };
      }
    }

    // 4. Price range in USD
    if (typeof options.minPrice === 'number' && !isNaN(options.minPrice)) {
      where.priceUSD = { ...where.priceUSD, gte: options.minPrice };
    }
    if (typeof options.maxPrice === 'number' && !isNaN(options.maxPrice)) {
      where.priceUSD = { ...where.priceUSD, lte: options.maxPrice };
    }

    // 5. Rating filter
    if (typeof options.rating === 'number' && !isNaN(options.rating) && options.rating > 0) {
      where.rating = { gte: options.rating };
    }

    // 6. In-stock only
    if (options.inStockOnly) {
      where.stock = { gt: 0 };
    }

    // 7. Search text filter (matches name, brand, description, subcategory, or tags)
    if (options.q && options.q.trim()) {
      const q = options.q.trim();
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { description: { contains: q } },
        { subcategory: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // 8. Sorting
    let orderBy: any = { createdAt: 'desc' };
    const sort = options.sort || 'relevance';
    if (sort === 'price_asc') {
      orderBy = { priceUSD: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { priceUSD: 'desc' };
    } else if (sort === 'rating_desc') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const products = rows.map(mapPrismaProduct);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getProductById(id: string): Promise<Product | null> {
    const row = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
      },
    });
    return row ? mapPrismaProduct(row) : null;
  }

  public async getProductByName(name: string): Promise<Product | null> {
    const clean = name.trim();
    // Exact or contains match
    const row = await prisma.product.findFirst({
      where: {
        OR: [{ name: { equals: clean } }, { name: { contains: clean } }],
      },
    });
    return row ? mapPrismaProduct(row) : null;
  }

  public async getCategories(): Promise<{ categories: string[]; subcategories: Record<string, string[]> }> {
    const rows = await prisma.product.findMany({
      select: { category: true, subcategory: true },
      distinct: ['category', 'subcategory'],
    });

    const subMap: Record<string, Set<string>> = {};
    rows.forEach(r => {
      if (!subMap[r.category]) subMap[r.category] = new Set();
      if (r.subcategory) subMap[r.category].add(r.subcategory);
    });

    const categories = Object.keys(subMap).sort();
    const subcategories: Record<string, string[]> = {};
    for (const cat of categories) {
      subcategories[cat] = Array.from(subMap[cat]).sort();
    }

    return { categories, subcategories };
  }

  public async getCategoryList(): Promise<string[]> {
    const res = await this.getCategories();
    return res.categories;
  }

  public async getBrands(category?: string): Promise<string[]> {
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    const rows = await prisma.product.findMany({
      where,
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });
    return rows.map(r => r.brand);
  }

  public async searchProducts(query: string, maxResults: number = 8): Promise<Product[]> {
    if (!query || !query.trim()) {
      const top = await prisma.product.findMany({
        take: maxResults,
        orderBy: { rating: 'desc' },
      });
      return top.map(mapPrismaProduct);
    }

    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

    // Fetch candidate pool matching any term
    const candidates = await prisma.product.findMany({
      where: {
        OR: terms.map(term => ({
          OR: [
            { name: { contains: term } },
            { brand: { contains: term } },
            { category: { contains: term } },
            { subcategory: { contains: term } },
            { tags: { contains: term } },
          ],
        })),
      },
      take: 60,
    });

    // Score candidates based on match relevance
    const scored = candidates.map(row => {
      const p = mapPrismaProduct(row);
      let score = 0;
      const text = `${p.name} ${p.brand} ${p.category} ${p.subcategory} ${p.description} ${p.tags.join(' ')} ${JSON.stringify(p.specs)}`.toLowerCase();

      for (const term of terms) {
        if (p.name.toLowerCase().includes(term)) score += 12;
        if (p.brand.toLowerCase().includes(term)) score += 10;
        if (p.category.toLowerCase().includes(term)) score += 8;
        if (p.subcategory.toLowerCase().includes(term)) score += 6;
        if (p.tags.some(t => t.toLowerCase().includes(term))) score += 5;
        if (text.includes(term)) score += 3;
      }

      return { product: p, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.product);
  }

  public async compareProducts(productIds: string[]): Promise<ComparisonMatrix> {
    const validIds = productIds.slice(0, 4); // Max 4 products for comparison
    const rows = await prisma.product.findMany({
      where: {
        OR: [{ id: { in: validIds } }, { sku: { in: validIds } }],
      },
    });

    const products = rows.map(mapPrismaProduct);
    if (products.length === 0) {
      return { products: [], categories: [], attributes: [] };
    }

    const categories = Array.from(new Set(products.map(p => p.category)));

    // Determine lowest price and highest rating
    const lowestPrice = Math.min(...products.map(p => p.priceUSD));
    const highestRating = Math.max(...products.map(p => p.rating));

    // Standard Comparison Attributes with Highlighted Best Values
    const attributes: ComparisonMatrix['attributes'] = [
      {
        key: 'price',
        label: 'Price (USD)',
        values: products.map(p => ({
          productId: p.id,
          value: `$${p.priceUSD.toFixed(2)}`,
          isBest: p.priceUSD === lowestPrice,
        })),
      },
      {
        key: 'rating',
        label: 'Customer Rating',
        values: products.map(p => ({
          productId: p.id,
          value: `${p.rating} / 5.0 (${p.reviewCount} reviews)`,
          isBest: p.rating === highestRating,
        })),
      },
      {
        key: 'brand',
        label: 'Brand',
        values: products.map(p => ({ productId: p.id, value: p.brand })),
      },
      {
        key: 'category',
        label: 'Category & Subcategory',
        values: products.map(p => ({ productId: p.id, value: `${p.category} → ${p.subcategory}` })),
      },
      {
        key: 'stock',
        label: 'Availability',
        values: products.map(p => ({
          productId: p.id,
          value: p.stock > 0 ? `${p.stock} in stock` : 'Out of stock',
          isBest: p.stock > 20,
        })),
      },
    ];

    // Collect all unique specification keys across comparing products
    const specKeys = new Set<string>();
    products.forEach(p => {
      Object.keys(p.specs || {}).forEach(k => specKeys.add(k));
    });

    specKeys.forEach(key => {
      attributes.push({
        key,
        label: key,
        values: products.map(p => ({
          productId: p.id,
          value: p.specs?.[key] !== undefined ? String(p.specs[key]) : '—',
        })),
      });
    });

    return {
      products,
      categories,
      attributes,
    };
  }
}

// Singleton database product provider
export const productProvider: IProductProvider = new DatabaseProductProvider();
