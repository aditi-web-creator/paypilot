import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DEMO_USER_ID } from '../middleware/auth.js';
import { dbProvider } from '../services/database/DatabaseProvider.js';

export async function getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const profile = await dbProvider.getProfile(userId);
    const budget = await dbProvider.getBudget(userId);
    const summary = await dbProvider.getSpendingSummary(userId);
    const orders = await dbProvider.getOrdersByUser(userId);

    // Recent 5 transactions
    const recentTransactions = orders.slice(0, 5);

    return res.json({
      success: true,
      data: {
        profile,
        budgetLimit: budget.budget_limit,
        totalSpent: summary.total_spent,
        remainingBudget: summary.remaining_budget,
        totalPurchases: summary.total_purchases,
        currency: budget.currency,
        recentTransactions,
        spendingTrend: summary.spending_trend,
        categoryBreakdown: summary.by_category,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSpendingAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const summary = await dbProvider.getSpendingSummary(userId);

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}
