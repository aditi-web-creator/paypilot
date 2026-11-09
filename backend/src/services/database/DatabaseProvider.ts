import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Profile,
  UserBudget,
  Cart,
  CartItem,
  Order,
  OrderItem,
  ShoppingSession,
  ShoppingMessage,
  SpendingSummary,
  ProductRecommendation,
  ShoppingRequirements,
} from '../../types/index.js';
import { productProvider } from '../catalog/ProductProvider.js';

export interface IDatabaseProvider {
  // Profiles
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, data: Partial<Profile>): Promise<Profile>;

  // Budgets
  getBudget(userId: string): Promise<UserBudget>;
  updateBudget(userId: string, budgetLimit: number, currency?: string): Promise<UserBudget>;

  // Shopping Sessions & Messages
  createSession(userId: string, originalPrompt?: string, requirements?: ShoppingRequirements): Promise<ShoppingSession>;
  getSession(sessionId: string): Promise<ShoppingSession | null>;
  updateSession(sessionId: string, data: Partial<ShoppingSession>): Promise<ShoppingSession | null>;
  addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, toolCalls?: any[], recommendations?: ProductRecommendation[]): Promise<ShoppingMessage>;
  getMessages(sessionId: string): Promise<ShoppingMessage[]>;

  // Carts
  getActiveCart(userId: string): Promise<Cart>;
  addItemToCart(userId: string, productId: string, quantity: number): Promise<Cart>;
  updateCartItem(userId: string, itemId: string, quantity: number): Promise<Cart>;
  removeCartItem(userId: string, itemId: string): Promise<Cart>;
  clearCart(userId: string): Promise<Cart>;

  // Orders
  createOrder(userId: string, paypalOrderId: string, cart: Cart): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  getOrderByPayPalId(paypalOrderId: string): Promise<Order | null>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'failed' | 'cancelled', captureId?: string): Promise<Order | null>;
  checkDuplicateCapture(paypalOrderId: string, captureId: string): Promise<boolean>;

  // Spending Analytics
  getSpendingSummary(userId: string): Promise<SpendingSummary>;
}

interface LocalStoreData {
  profiles: Profile[];
  budgets: UserBudget[];
  sessions: ShoppingSession[];
  messages: ShoppingMessage[];
  carts: Cart[];
  orders: Order[];
}

export class LocalDatabaseProvider implements IDatabaseProvider {
  private dataFilePath: string;
  private store: LocalStoreData;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // Ignore if already exists
      }
    }
    this.dataFilePath = path.join(dataDir, 'store.json');
    this.store = this.loadStore();
  }

  private loadStore(): LocalStoreData {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing store file, initializing fresh store.', e);
    }

    // Default Seed Data
    const defaultUserId = '00000000-0000-0000-0000-000000000001';
    const initial: LocalStoreData = {
      profiles: [
        {
          id: defaultUserId,
          email: 'demo.shopper@paypilot.ai',
          full_name: 'Alex Mercer',
          preferred_currency: 'USD',
          created_at: new Date().toISOString(),
        },
      ],
      budgets: [
        {
          id: '00000000-0000-0000-0000-000000000002',
          user_id: defaultUserId,
          budget_limit: 500.0,
          currency: 'USD',
          updated_at: new Date().toISOString(),
        },
      ],
      sessions: [],
      messages: [],
      carts: [],
      orders: [],
    };

    this.saveStore(initial);
    return initial;
  }

  private saveStore(data: LocalStoreData = this.store): void {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist store:', e);
    }
  }

  // --- Profiles ---
  public async getProfile(userId: string): Promise<Profile | null> {
    const profile = this.store.profiles.find(p => p.id === userId);
    return profile || null;
  }

  public async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    let profile = this.store.profiles.find(p => p.id === userId);
    if (!profile) {
      profile = {
        id: userId,
        email: data.email || 'user@paypilot.ai',
        full_name: data.full_name || 'PayPilot User',
        preferred_currency: data.preferred_currency || 'USD',
        created_at: new Date().toISOString(),
      };
      this.store.profiles.push(profile);
    } else {
      Object.assign(profile, data);
    }
    this.saveStore();
    return profile;
  }

  // --- Budgets ---
  public async getBudget(userId: string): Promise<UserBudget> {
    let budget = this.store.budgets.find(b => b.user_id === userId);
    if (!budget) {
      budget = {
        id: uuidv4(),
        user_id: userId,
        budget_limit: 500.0,
        currency: 'USD',
        updated_at: new Date().toISOString(),
      };
      this.store.budgets.push(budget);
      this.saveStore();
    }
    return budget;
  }

  public async updateBudget(userId: string, budgetLimit: number, currency: string = 'USD'): Promise<UserBudget> {
    let budget = this.store.budgets.find(b => b.user_id === userId);
    if (!budget) {
      budget = {
        id: uuidv4(),
        user_id: userId,
        budget_limit: budgetLimit,
        currency,
        updated_at: new Date().toISOString(),
      };
      this.store.budgets.push(budget);
    } else {
      budget.budget_limit = budgetLimit;
      budget.currency = currency;
      budget.updated_at = new Date().toISOString();
    }
    this.saveStore();
    return budget;
  }

  // --- Sessions & Messages ---
  public async createSession(userId: string, originalPrompt?: string, requirements?: ShoppingRequirements): Promise<ShoppingSession> {
    const session: ShoppingSession = {
      id: uuidv4(),
      user_id: userId,
      original_prompt: originalPrompt,
      extracted_requirements: requirements,
      budget: requirements?.budget,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.store.sessions.push(session);
    this.saveStore();
    return session;
  }

  public async getSession(sessionId: string): Promise<ShoppingSession | null> {
    return this.store.sessions.find(s => s.id === sessionId) || null;
  }

  public async updateSession(sessionId: string, data: Partial<ShoppingSession>): Promise<ShoppingSession | null> {
    const session = this.store.sessions.find(s => s.id === sessionId);
    if (!session) return null;
    Object.assign(session, data);
    this.saveStore();
    return session;
  }

  public async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    toolCalls?: any[],
    recommendations?: ProductRecommendation[]
  ): Promise<ShoppingMessage> {
    const msg: ShoppingMessage = {
      id: uuidv4(),
      session_id: sessionId,
      role,
      content,
      tool_calls: toolCalls,
      recommendations,
      created_at: new Date().toISOString(),
    };
    this.store.messages.push(msg);
    this.saveStore();
    return msg;
  }

  public async getMessages(sessionId: string): Promise<ShoppingMessage[]> {
    return this.store.messages
      .filter(m => m.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // --- Carts ---
  public async getActiveCart(userId: string): Promise<Cart> {
    let cart = this.store.carts.find(c => c.user_id === userId && c.status === 'active');
    if (!cart) {
      cart = {
        id: uuidv4(),
        user_id: userId,
        status: 'active',
        currency: 'USD',
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        created_at: new Date().toISOString(),
      };
      this.store.carts.push(cart);
      this.saveStore();
    }

    // Hydrate cart items with latest product data and recalculate totals
    await this.recalculateCart(cart);
    return cart;
  }

  private async recalculateCart(cart: Cart): Promise<void> {
    let subtotal = 0;
    for (const item of cart.items) {
      const product = await productProvider.getProductById(item.product_id);
      if (product) {
        item.product = product;
        item.unit_price_snapshot = product.price;
        subtotal += product.price * item.quantity;
      }
    }
    cart.subtotal = Math.round(subtotal * 100) / 100;
    // Free shipping over $50, else $9.99
    cart.shipping = cart.subtotal > 50 || cart.subtotal === 0 ? 0 : 9.99;
    // 8% tax calculation
    cart.tax = Math.round(cart.subtotal * 0.08 * 100) / 100;
    cart.total = Math.round((cart.subtotal + cart.shipping + cart.tax) * 100) / 100;
  }

  public async addItemToCart(userId: string, productId: string, quantity: number = 1): Promise<Cart> {
    const cart = await this.getActiveCart(userId);
    const product = await productProvider.getProductById(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const existingIndex = cart.items.findIndex(i => i.product_id === productId);
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        id: uuidv4(),
        cart_id: cart.id,
        product_id: productId,
        quantity,
        unit_price_snapshot: product.price,
        product,
      });
    }

    await this.recalculateCart(cart);
    this.saveStore();
    return cart;
  }

  public async updateCartItem(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getActiveCart(userId);
    const itemIndex = cart.items.findIndex(i => i.id === itemId);
    if (itemIndex < 0) {
      throw new Error(`Cart item not found: ${itemId}`);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await this.recalculateCart(cart);
    this.saveStore();
    return cart;
  }

  public async removeCartItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getActiveCart(userId);
    cart.items = cart.items.filter(i => i.id !== itemId);
    await this.recalculateCart(cart);
    this.saveStore();
    return cart;
  }

  public async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getActiveCart(userId);
    cart.items = [];
    await this.recalculateCart(cart);
    this.saveStore();
    return cart;
  }

  // --- Orders ---
  public async createOrder(userId: string, paypalOrderId: string, cart: Cart): Promise<Order> {
    const orderItems: OrderItem[] = cart.items.map(item => ({
      id: uuidv4(),
      order_id: '',
      product_id: item.product_id,
      product_name_snapshot: item.product?.name || 'Product',
      quantity: item.quantity,
      unit_price: item.unit_price_snapshot,
      product: item.product,
    }));

    const orderId = uuidv4();
    orderItems.forEach(i => (i.order_id = orderId));

    const order: Order = {
      id: orderId,
      user_id: userId,
      cart_id: cart.id,
      paypal_order_id: paypalOrderId,
      total_amount: cart.total,
      currency: cart.currency,
      payment_status: 'pending',
      items: orderItems,
      created_at: new Date().toISOString(),
    };

    this.store.orders.unshift(order);

    // Mark current cart as ordered and reset active cart
    cart.status = 'ordered';
    this.saveStore();

    return order;
  }

  public async getOrder(orderId: string): Promise<Order | null> {
    return this.store.orders.find(o => o.id === orderId) || null;
  }

  public async getOrderByPayPalId(paypalOrderId: string): Promise<Order | null> {
    return this.store.orders.find(o => o.paypal_order_id === paypalOrderId) || null;
  }

  public async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.store.orders.filter(o => o.user_id === userId);
  }

  public async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'completed' | 'failed' | 'cancelled',
    captureId?: string
  ): Promise<Order | null> {
    const order = this.store.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.payment_status = status;
    if (captureId) {
      order.capture_id = captureId;
    }
    this.saveStore();
    return order;
  }

  public async checkDuplicateCapture(paypalOrderId: string, captureId: string): Promise<boolean> {
    return this.store.orders.some(
      o => o.payment_status === 'completed' && (o.paypal_order_id === paypalOrderId || (captureId && o.capture_id === captureId))
    );
  }

  // --- Spending Summary & Analytics ---
  public async getSpendingSummary(userId: string): Promise<SpendingSummary> {
    const userOrders = this.store.orders.filter(o => o.user_id === userId && o.payment_status === 'completed');
    const budget = await this.getBudget(userId);

    let totalSpent = 0;
    const categoryMap: { [cat: string]: { amount: number; count: number } } = {};
    const dateMap: { [date: string]: number } = {};

    for (const order of userOrders) {
      totalSpent += order.total_amount;
      const dateKey = order.created_at.split('T')[0];
      dateMap[dateKey] = (dateMap[dateKey] || 0) + order.total_amount;

      for (const item of order.items) {
        const product = await productProvider.getProductById(item.product_id);
        const cat = product?.category || 'General';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { amount: 0, count: 0 };
        }
        categoryMap[cat].amount += item.unit_price * item.quantity;
        categoryMap[cat].count += item.quantity;
      }
    }

    const byCategory = Object.keys(categoryMap).map(cat => ({
      category: cat,
      amount: Math.round(categoryMap[cat].amount * 100) / 100,
      count: categoryMap[cat].count,
    }));

    const spendingTrend = Object.keys(dateMap)
      .sort()
      .map(date => ({
        date,
        amount: Math.round(dateMap[date] * 100) / 100,
      }));

    totalSpent = Math.round(totalSpent * 100) / 100;
    const remainingBudget = Math.max(0, Math.round((budget.budget_limit - totalSpent) * 100) / 100);

    return {
      total_spent: totalSpent,
      budget_limit: budget.budget_limit,
      remaining_budget: remainingBudget,
      total_purchases: userOrders.length,
      currency: budget.currency,
      by_category: byCategory,
      spending_trend: spendingTrend,
    };
  }
}

// Singleton database provider instance
export const dbProvider: IDatabaseProvider = new LocalDatabaseProvider();
