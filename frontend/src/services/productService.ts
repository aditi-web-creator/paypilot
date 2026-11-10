import { request } from './api';
import { ComparisonMatrix, Product } from '../types';

export interface ProductFilterParams {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStockOnly?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productService = {
  async getProducts(params: ProductFilterParams = {}): Promise<ProductsResponse['data']> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.subcategory && params.subcategory !== 'all') query.append('subcategory', params.subcategory);
    if (params.brand && params.brand !== 'all') {
      if (Array.isArray(params.brand)) {
        params.brand.forEach(b => query.append('brand', b));
      } else {
        query.append('brand', params.brand);
      }
    }
    if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params.rating !== undefined && params.rating > 0) query.append('rating', String(params.rating));
    if (params.inStockOnly) query.append('inStockOnly', 'true');
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await request<ProductsResponse>(`/products?${query.toString()}`);
    return res.data;
  },

  async getTotalCount(): Promise<number> {
    try {
      const res = await request<{ success: boolean; data: { total: number } }>('/products/count');
      return res.data?.total || 384;
    } catch {
      return 384;
    }
  },

  async getCategories(): Promise<string[]> {
    const res = await request<{ success: boolean; data: string[]; subcategories?: Record<string, string[]> }>('/products/categories');
    return Array.isArray(res.data) ? res.data : (res as any).categories || [];
  },

  async getCategoriesWithSubcategories(): Promise<{ categories: string[]; subcategories: Record<string, string[]> }> {
    const res = await request<{ success: boolean; data: string[]; subcategories?: Record<string, string[]> }>('/products/categories');
    return {
      categories: Array.isArray(res.data) ? res.data : [],
      subcategories: res.subcategories || {},
    };
  },

  async getBrands(category?: string): Promise<string[]> {
    const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await request<{ success: boolean; data: string[] }>(`/products/brands${query}`);
    return res.data || [];
  },

  async getProductById(id: string): Promise<Product> {
    const res = await request<{ success: boolean; data: Product }>(`/products/${id}`);
    return res.data;
  },

  async compareProducts(productIds: string[]): Promise<ComparisonMatrix> {
    const res = await request<{ success: boolean; data: ComparisonMatrix }>('/products/compare', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
    return res.data;
  },
};
