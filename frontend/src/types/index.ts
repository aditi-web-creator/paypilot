export interface ProductSpecifications {
  [key: string]: string | number | boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  specifications: ProductSpecifications;
  image_url: string;
  rating: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at: string;
}

export interface ShoppingRequirements {
  category?: string;
  budget?: number;
  currency: string;
  preferences: string[];
  brand_preference?: string[];
  min_rating?: number;
}

export interface ProductRecommendation {
  product: Product;
  match_score: number;
  match_reasons: string[];
  budget_fit: 'well_within' | 'at_budget' | 'slightly_over' | 'significantly_over';
  trade_offs?: string[];
}

export interface AgentActivityStep {
  step: 'understanding_requirements' | 'searching_catalog' | 'comparing_products' | 'evaluating_budget' | 'preparing_recommendations' | 'preparing_cart';
  label: string;
  status: 'in_progress' | 'completed' | 'failed';
  details?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  recommendations?: ProductRecommendation[];
  activitySteps?: AgentActivityStep[];
  toolCalls?: any[];
  timestamp: string;
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

export interface UserProfile {
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

export interface ComparisonMatrix {
  products: Product[];
  categories: string[];
  attributes: {
    key: string;
    label: string;
    values: { productId: string; value: string | number | boolean }[];
  }[];
}
