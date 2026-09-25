import { Router, Request, Response } from 'express';
import { isSupabaseConfigured, testSupabaseConnection } from '../config/supabase';

const router = Router();

/**
 * @route GET /api/health
 * @desc System diagnostic health check (Express API status + Supabase DB status)
 * @access Public
 */
router.get('/health', async (_req: Request, res: Response) => {
  const supabaseConfigured = isSupabaseConfigured();
  const supabaseConnection = await testSupabaseConnection();

  res.status(200).json({
    status: 'online',
    appName: 'FarmSheild Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      expressApi: {
        status: 'healthy',
        uptimeSeconds: Math.floor(process.uptime()),
      },
      supabase: {
        configured: supabaseConfigured,
        connected: supabaseConnection.connected,
        message: supabaseConnection.message,
        details: supabaseConnection.details,
      },
    },
  });
});

export default router;
