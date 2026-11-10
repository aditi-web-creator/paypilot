import request from 'supertest';
import { app } from '../src/app.js';
import { productProvider } from '../src/services/catalog/ProductProvider.js';
import { dbProvider } from '../src/services/database/DatabaseProvider.js';

describe('PayPilot Backend API Test Suite', () => {
  const testUserId = '00000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    // Reset test user budget and clean cart
    await dbProvider.updateBudget(testUserId, 500.0, 'USD');
    await dbProvider.clearCart(testUserId);
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status with runtime metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.application).toBe('PayPilot Backend');
    });
  });

  describe('Catalog & Product Provider (360+ Items across 12 categories)', () => {
    it('should return 12 distinct categories', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(12);
      expect(res.body.data).toContain('Electronics');
      expect(res.body.data).toContain('Fashion');
      expect(res.body.data).toContain('Gaming');
      expect(res.body.data).toContain('Home & Kitchen');
    });

    it('should retrieve paginated products with total >= 360', async () => {
      const res = await request(app).get('/api/products?page=1&limit=20');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(360);
      expect(res.body.data.products.length).toBe(20);
    });

    it('should filter products by category and price range', async () => {
      const res = await request(app).get('/api/products?category=Electronics&minPrice=30&maxPrice=150');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.products.forEach((p: any) => {
        expect(p.category).toBe('Electronics');
        expect(p.price).toBeGreaterThanOrEqual(30);
        expect(p.price).toBeLessThanOrEqual(150);
      });
    });

    it('should return exact product details by ID', async () => {
      const allRes = await request(app).get('/api/products?limit=1');
      const firstProduct = allRes.body.data.products[0];

      const res = await request(app).get(`/api/products/${firstProduct.id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(firstProduct.id);
      expect(res.body.data.specifications).toBeDefined();
    });

    it('should compare two or more products with a structured matrix', async () => {
      const allRes = await request(app).get('/api/products?limit=2');
      const [p1, p2] = allRes.body.data.products;

      const res = await request(app)
        .post('/api/products/compare')
        .send({ productIds: [p1.id, p2.id] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(2);
      expect(res.body.data.attributes.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('AI Shopping Agent & Requirement Extraction', () => {
    it('should extract structured shopping requirements from natural language', async () => {
      const res = await request(app)
        .post('/api/ai/extract-requirements')
        .send({ prompt: 'Find wireless headphones under $150 with active noise cancellation and long battery life' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe('Electronics');
      expect(res.body.data.budget).toBe(150);
      expect(res.body.data.preferences).toContain('battery life');
    });

    it('should process user shopping chat and return curated recommendations with budget fit', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          message: 'Find wireless headphones for studying under $100 with long battery life',
          userId: testUserId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toBeDefined();
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);
      expect(res.body.data.activitySteps.length).toBeGreaterThan(0);
      expect(res.body.data.toolCalls.length).toBeGreaterThan(0);
    });

    it('should answer product questions accurately using strictly catalog data', async () => {
      const allRes = await request(app).get('/api/products?category=Electronics&limit=1');
      const sample = allRes.body.data.products[0];

      const res = await request(app)
        .post('/api/ai/product-details')
        .send({
          productId: sample.id,
          question: 'What is the battery life and connectivity?',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.explanation).toContain(sample.name);
    });
  });

  describe('Shopping Cart & Budget Enforcement', () => {
    let sampleProduct: any;

    beforeAll(async () => {
      // Pick a moderately priced product within budget ($20 - $60) so 2x stays under $500 limit
      const res = await request(app).get('/api/products?minPrice=20&maxPrice=60&limit=1');
      sampleProduct = res.body.data.products[0];
    });

    it('should add items to cart and calculate correct server-side totals (subtotal, shipping, tax)', async () => {
      await request(app).delete('/api/cart');

      const addRes = await request(app)
        .post('/api/cart/items')
        .send({ productId: sampleProduct.id, quantity: 2 });

      expect(addRes.status).toBe(201);
      const cart = addRes.body.data;
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.subtotal).toBeCloseTo(sampleProduct.price * 2, 1);
      expect(cart.tax).toBeCloseTo(cart.subtotal * 0.08, 1);
      expect(cart.total).toBeCloseTo(cart.subtotal + cart.shipping + cart.tax, 1);
    });

    it('should validate cart against user budget limit', async () => {
      const valRes = await request(app).post('/api/cart/validate');
      expect(valRes.status).toBe(200);
      expect(valRes.body.success).toBe(true);
      expect(valRes.body.data.isValid).toBe(true);
    });

    it('should block checkout when cart exceeds user budget limit', async () => {
      // Set a tiny budget of $10
      await request(app)
        .put('/api/budget')
        .send({ budgetLimit: 10.0, currency: 'USD' });

      const checkoutRes = await request(app)
        .post('/api/payments/paypal/create-order')
        .send({ currency: 'USD' });

      expect(checkoutRes.status).toBe(422);
      expect(checkoutRes.body.error).toContain('Budget Exceeded');

      // Restore budget to $500
      await request(app)
        .put('/api/budget')
        .send({ budgetLimit: 500.0, currency: 'USD' });
    });
  });

  describe('PayPal Orders API v2 & Capture Workflow', () => {
    let createdPayPalOrderId: string;

    it('should create a valid PayPal Sandbox order for current cart', async () => {
      const res = await request(app)
        .post('/api/payments/paypal/create-order')
        .send({ currency: 'USD' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paypalOrderId).toBeDefined();
      createdPayPalOrderId = res.body.data.paypalOrderId;
    });

    it('should capture the PayPal order and update order status to completed', async () => {
      const capRes = await request(app)
        .post('/api/payments/paypal/capture-order')
        .send({ orderId: createdPayPalOrderId });

      expect(capRes.status).toBe(200);
      expect(capRes.body.success).toBe(true);
      expect(capRes.body.data.status).toBe('COMPLETED');
      expect(capRes.body.data.captureId).toBeDefined();
    });

    it('should prevent duplicate payment capture for the same order', async () => {
      const dupRes = await request(app)
        .post('/api/payments/paypal/capture-order')
        .send({ orderId: createdPayPalOrderId });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.error).toContain('Duplicate Capture Prevented');
    });

    it('should verify completed order in user order history', async () => {
      const ordersRes = await request(app).get('/api/orders');
      expect(ordersRes.status).toBe(200);
      expect(ordersRes.body.success).toBe(true);
      const found = ordersRes.body.data.find((o: any) => o.paypal_order_id === createdPayPalOrderId);
      expect(found).toBeDefined();
      expect(found.payment_status).toBe('completed');
    });
  });

  describe('Dashboard & Spending Analytics', () => {
    it('should return real dashboard statistics from persisted orders and budget', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSpent).toBeGreaterThan(0);
      expect(res.body.data.recentTransactions.length).toBeGreaterThan(0);
      expect(res.body.data.categoryBreakdown.length).toBeGreaterThan(0);
    });
  });
});
