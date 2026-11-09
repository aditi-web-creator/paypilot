import { request } from './api';
import { Order, SpendingSummary, UserBudget, UserProfile } from '../types';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const res = await request<{ success: boolean; data: Order[] }>('/orders');
    return res.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await request<{ success: boolean; data: Order }>(`/orders/${id}`);
    return res.data;
  },
};

export const budgetService = {
  async getBudgetAndSummary(): Promise<{ budget: UserBudget; summary: SpendingSummary }> {
    const res = await request<{ success: boolean; data: { budget: UserBudget; summary: SpendingSummary } }>('/budget');
    return res.data;
  },

  async updateBudget(budgetLimit: number, currency: string = 'USD'): Promise<UserBudget> {
    const res = await request<{ success: boolean; data: UserBudget }>('/budget', {
      method: 'PUT',
      body: JSON.stringify({ budgetLimit, currency }),
    });
    return res.data;
  },

  async getDashboardSummary(): Promise<{
    profile: UserProfile;
    budgetLimit: number;
    totalSpent: number;
    remainingBudget: number;
    totalPurchases: number;
    currency: string;
    recentTransactions: Order[];
    spendingTrend: { date: string; amount: number }[];
    categoryBreakdown: { category: string; amount: number; count: number }[];
  }> {
    const res = await request<{ success: boolean; data: any }>('/dashboard/summary');
    return res.data;
  },
};
