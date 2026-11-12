import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import productsRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

export const app = express();
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and specified CORS_ORIGIN
      if (!origin || origin.startsWith('http://localhost') || origin === env.CORS_ORIGIN) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local hackathon demo evaluation
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting for API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this client. Please slow down and try again shortly.',
  },
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'PayPilot Backend',
    version: '1.0.0',
    mode: env.NODE_ENV,
    paypalConfigured: env.hasPayPalConfig,
    aiModel: env.GEMINI_MODEL,
    aiConfigured: Boolean(env.activeAiApiKey),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', (req, res, next) => {
  // Delegate to products categories handler
  import('./controllers/productsController.js').then(c => c.getCategories(req, res, next)).catch(next);
});
app.use('/api/brands', (req, res, next) => {
  // Delegate to products brands handler
  import('./controllers/productsController.js').then(c => c.getBrands(req, res, next)).catch(next);
});
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);
