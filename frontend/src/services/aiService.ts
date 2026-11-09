import { request } from './api';
import { AgentActivityStep, Cart, Product, ProductRecommendation, ShoppingRequirements } from '../types';

export interface ChatResponseData {
  sessionId: string;
  reply: string;
  requirements?: ShoppingRequirements;
  recommendations: ProductRecommendation[];
  cart?: Cart;
  budgetStatus?: {
    limit: number;
    spent: number;
    remaining: number;
    isOverBudget: boolean;
  };
  activitySteps: AgentActivityStep[];
  toolCalls: { tool: string; input: any; output: any; status: 'success' | 'error' }[];
}

export const aiService = {
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponseData> {
    const res = await request<{ success: boolean; data: ChatResponseData }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
    return res.data;
  },

  async extractRequirements(prompt: string): Promise<ShoppingRequirements> {
    const res = await request<{ success: boolean; data: ShoppingRequirements }>('/ai/extract-requirements', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    return res.data;
  },

  async askProductDetails(productId: string, question: string): Promise<{ product: Product; explanation: string }> {
    const res = await request<{ success: boolean; data: { product: Product; explanation: string } }>('/ai/product-details', {
      method: 'POST',
      body: JSON.stringify({ productId, question }),
    });
    return res.data;
  },
};
