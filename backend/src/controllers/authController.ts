import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DEMO_USER_ID } from '../middleware/auth.js';
import { dbProvider } from '../services/database/DatabaseProvider.js';

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    let profile = await dbProvider.getProfile(DEMO_USER_ID);
    if (!profile) {
      profile = await dbProvider.updateProfile(DEMO_USER_ID, {
        email: email || 'demo.shopper@paypilot.ai',
        full_name: 'Alex Mercer',
        preferred_currency: 'USD',
      });
    }

    return res.json({
      success: true,
      token: DEMO_USER_ID,
      user: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { email, full_name, preferred_currency } = req.body;
    const profile = await dbProvider.updateProfile(DEMO_USER_ID, {
      email,
      full_name,
      preferred_currency: preferred_currency || 'USD',
    });

    return res.status(201).json({
      success: true,
      token: DEMO_USER_ID,
      user: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const profile = await dbProvider.getProfile(userId);
    const budget = await dbProvider.getBudget(userId);

    return res.json({
      success: true,
      user: profile,
      budget,
    });
  } catch (error) {
    next(error);
  }
}
