import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend or root directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // AI Configuration
  GEMINI_API_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // PayPal Sandbox Configuration
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_BASE_URL: z.string().default('https://api-m.sandbox.paypal.com'),
  PAYPAL_CURRENCY: z.string().default('USD'),

  // Supabase Configuration (Optional for local dev, used in cloud)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Environment variable configuration error.');
}

export const env = {
  ...parsedEnv.data,
  // Helper to get active AI key
  activeAiApiKey: parsedEnv.data.GEMINI_API_KEY || parsedEnv.data.AI_API_KEY || '',
  hasPayPalConfig: Boolean(parsedEnv.data.PAYPAL_CLIENT_ID && parsedEnv.data.PAYPAL_CLIENT_SECRET && !parsedEnv.data.PAYPAL_CLIENT_ID.includes('your_')),
  hasSupabaseConfig: Boolean(parsedEnv.data.SUPABASE_URL && parsedEnv.data.SUPABASE_SERVICE_ROLE_KEY && !parsedEnv.data.SUPABASE_URL.includes('your-project')),
};
