// ============================================================================
// PayPilot Domain Types & Data Contracts
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  preferred_currency: string;
  created_at: string;
}

export interface UserBudget {
  id: string;
  user_id: string;
  budget_limit: number;
  currency: string;
  updated_at: string;
}

export interface ProductSpecifications {
  [key: string]: string | number | boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  priceUSD: number;
  originalPriceUSD?: number;
  price: number; // backward-compatible alias to priceUSD
  currency: string;
  rating: number;
  reviewCount: number;
  stock: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl: string;
  image_url: string; // backward-compatible alias to imageUrl
  tags: string[];
  specs: ProductSpecifications;
  specifications: ProductSpecifications; // backward-compatible alias to specs
  createdAt: string;
  created_at: string; // backward-compatible alias to createdAt
}

export interface ShoppingRequirements {
  category?: string;
  subcategory?: string;
  budget?: number;
  budgetUSD?: number;
  currency: string;
  preferences: string[];
  brand_preference?: string[];
  min_rating?: number;
}

export interface ProductRecommendation {
  product: Product;
  match_score: number; // 0 - 100
  match_reasons: string[];
  budget_fit: 'well_within' | 'at_budget' | 'slightly_over' | 'significantly_over';
  budget_impact_percent?: number; // e.g. "Uses 12% of your remaining budget"
  budget_impact_percentage?: number; // alias
  why_this_pick?: string; // one-line reason required by PART 3
  is_over_budget?: boolean;
  cheaper_alternative?: Product; // suggested alternative if over budget
  trade_offs?: string[];
}

export interface ShoppingSession {
  id: string;
  user_id: string;
  original_prompt?: string;
  extracted_requirements?: ShoppingRequirements;
  budget?: number;
  status: 'active' | 'cart_prepared' | 'completed' | 'abandoned';
  created_at: string;
}

export interface ShoppingMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  spoken_summary?: string; // concise summary for text-to-speech voice
  tool_calls?: any[];
  recommendations?: ProductRecommendation[];
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price_snapshot: number;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  session_id?: string;
  status: 'active' | 'ordered' | 'abandoned';
  currency: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  cart_id?: string;
  paypal_order_id?: string;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  capture_id?: string;
  items: OrderItem[];
  created_at: string;
}

export interface SpendingSummary {
  total_spent: number;
  budget_limit: number;
  remaining_budget: number;
  total_purchases: number;
  currency: string;
  by_category: { category: string; amount: number; count: number }[];
  spending_trend: { date: string; amount: number }[];
}

export interface AgentActivityStep {
  step: 'understanding_requirements' | 'searching_catalog' | 'comparing_products' | 'evaluating_budget' | 'preparing_recommendations' | 'preparing_cart';
  label: string;
  status: 'in_progress' | 'completed' | 'failed';
  details?: string;
  timestamp: string;
}
