import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DEMO_USER_ID } from '../middleware/auth.js';
import { dbProvider } from '../services/database/DatabaseProvider.js';

export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const cart = await dbProvider.getActiveCart(userId);
    const budget = await dbProvider.getBudget(userId);
    const summary = await dbProvider.getSpendingSummary(userId);

    const isOverBudget = summary.total_spent + cart.total > budget.budget_limit;

    return res.json({
      success: true,
      data: {
        cart,
        budget: {
          limit: budget.budget_limit,
          currentSpent: summary.total_spent,
          remaining: summary.remaining_budget,
          isOverBudget,
          exceededBy: isOverBudget ? summary.total_spent + cart.total - budget.budget_limit : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const { productId, quantity } = req.body;

    const cart = await dbProvider.addItemToCart(userId, productId, quantity || 1);
    return res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await dbProvider.updateCartItem(userId, id, quantity);
    return res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const { id } = req.params;

    const cart = await dbProvider.removeCartItem(userId, id);
    return res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const cart = await dbProvider.clearCart(userId);
    return res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function validateCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const cart = await dbProvider.getActiveCart(userId);
    const budget = await dbProvider.getBudget(userId);
    const summary = await dbProvider.getSpendingSummary(userId);

    const projected = summary.total_spent + cart.total;
    const isBudgetOk = projected <= budget.budget_limit;

    return res.json({
      success: true,
      data: {
        isValid: cart.items.length > 0 && isBudgetOk,
        itemCount: cart.items.length,
        total: cart.total,
        isBudgetOk,
        budgetLimit: budget.budget_limit,
        currentSpent: summary.total_spent,
        projectedTotal: projected,
        message: !isBudgetOk
          ? `Cart exceeds spending limit of $${budget.budget_limit.toFixed(2)}.`
          : cart.items.length === 0
          ? 'Cart is empty.'
          : 'Cart validated successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
}
