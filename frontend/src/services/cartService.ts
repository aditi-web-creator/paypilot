import { request } from './api';
import { Cart } from '../types';

export interface CartResponseData {
  cart: Cart;
  budget: {
    limit: number;
    currentSpent: number;
    remaining: number;
    isOverBudget: boolean;
    exceededBy: number;
  };
}

export const cartService = {
  async getCart(): Promise<CartResponseData> {
    const res = await request<{ success: boolean; data: CartResponseData }>('/cart');
    return res.data;
  },

  async addItem(productId: string, quantity: number = 1): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return res.data;
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return res.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async clearCart(): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>('/cart', {
      method: 'DELETE',
    });
    return res.data;
  },

  async validateCart(): Promise<{
    isValid: boolean;
    itemCount: number;
    total: number;
    isBudgetOk: boolean;
    budgetLimit: number;
    currentSpent: number;
    projectedTotal: number;
    message: string;
  }> {
    const res = await request<{ success: boolean; data: any }>('/cart/validate', {
      method: 'POST',
    });
    return res.data;
  },
};
