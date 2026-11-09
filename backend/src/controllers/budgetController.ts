import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DEMO_USER_ID } from '../middleware/auth.js';
import { dbProvider } from '../services/database/DatabaseProvider.js';

export async function getBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const budget = await dbProvider.getBudget(userId);
    const summary = await dbProvider.getSpendingSummary(userId);

    return res.json({
      success: true,
      data: {
        budget,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const { budgetLimit, currency } = req.body;

    const updated = await dbProvider.updateBudget(userId, Number(budgetLimit), currency || 'USD');

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
