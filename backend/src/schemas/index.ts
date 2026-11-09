import { z } from 'zod';

// AI Schemas
export const chatMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty'),
  userId: z.string().default('00000000-0000-0000-0000-000000000001'),
});

export const extractRequirementsSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
});

export const productDetailsQuerySchema = z.object({
  productId: z.string().optional(),
  productName: z.string().optional(),
  question: z.string().optional(),
});

// Products Schemas
export const productQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'name_asc', 'relevance']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const productCompareSchema = z.object({
  productIds: z.array(z.string()).min(2, 'At least 2 products required for comparison').max(5, 'Maximum 5 products allowed for comparison'),
});

// Cart Schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

// Payment Schemas
export const createPayPalOrderSchema = z.object({
  cartId: z.string().optional(),
  currency: z.string().default('USD'),
});

export const capturePayPalOrderSchema = z.object({
  orderId: z.string().min(1, 'PayPal Order ID is required'),
  cartId: z.string().optional(),
});

// Budget Schemas
export const updateBudgetSchema = z.object({
  budgetLimit: z.number().positive('Budget limit must be greater than zero'),
  currency: z.string().default('USD'),
});
