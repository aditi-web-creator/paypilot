import { Request, Response, NextFunction } from 'express';
import { dbProvider } from '../services/database/DatabaseProvider.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    preferred_currency: string;
  };
}

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Check for authorization header or demo fallback
    const authHeader = req.headers.authorization;
    let userId = DEMO_USER_ID;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token && token !== 'demo-token') {
        userId = token;
      }
    }

    let profile = await dbProvider.getProfile(userId);
    if (!profile) {
      profile = await dbProvider.updateProfile(userId, {
        email: 'demo.shopper@paypilot.ai',
        full_name: 'Alex Mercer',
        preferred_currency: 'USD',
      });
    }

    req.user = profile;
    next();
  } catch (error) {
    next(error);
  }
}
