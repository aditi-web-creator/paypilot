import { app } from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
=====================================================
  PAYPILOT BACKEND SERVER RUNNING
  Port: ${PORT}
  Environment: ${env.NODE_ENV}
  PayPal Sandbox: ${env.hasPayPalConfig ? 'LIVE CREDENTIALS' : 'DEMO SANDBOX SIMULATION'}
  Gemini AI: ${env.activeAiApiKey ? `ACTIVE (${env.GEMINI_MODEL})` : 'INTELLIGENT LOCAL NLP FALLBACK'}
  Database: ${env.hasSupabaseConfig ? 'SUPABASE POSTGRESQL' : 'LOCAL PERSISTENT STORE'}
  Health Check: http://localhost:${PORT}/api/health
=====================================================
  `);
});

export default server;
