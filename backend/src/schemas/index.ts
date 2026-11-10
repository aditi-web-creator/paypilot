import { z } from 'zod';

// AI Schemas
export const chatMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty'),
  userId: z.string().default('00000000-0000-0000-0000-000000000001'),
  userName: z.string().optional(),
  currency: z.string().optional(),
  monthlyLimitUSD: z.number().optional(),
  currentSpendUSD: z.number().optional(),
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
  subcategory: z.string().optional(),
  brand: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  inStockOnly: z.preprocess((val) => val === 'true' || val === true || val === '1', z.boolean().optional()).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'name_asc', 'newest', 'relevance']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const productCompareSchema = z.object({
  ids: z.array(z.string()).min(2, 'At least 2 products required for comparison').max(5).optional(),
  productIds: z.array(z.string()).min(2, 'At least 2 products required for comparison').max(5).optional(),
}).refine(data => (data.ids && data.ids.length >= 2) || (data.productIds && data.productIds.length >= 2), {
  message: 'Must provide either ids or productIds with at least 2 product IDs',
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
