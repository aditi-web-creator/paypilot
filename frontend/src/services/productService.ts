import { request } from './api';
import { ComparisonMatrix, Product } from '../types';

export interface ProductFilterParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
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
    if (params.brand && params.brand !== 'all') query.append('brand', params.brand);
    if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await request<ProductsResponse>(`/products?${query.toString()}`);
    return res.data;
  },

  async getCategories(): Promise<string[]> {
    const res = await request<{ success: boolean; data: string[] }>('/products/categories');
    return res.data;
  },

  async getBrands(category?: string): Promise<string[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await request<{ success: boolean; data: string[] }>(`/products/brands${query}`);
    return res.data;
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
