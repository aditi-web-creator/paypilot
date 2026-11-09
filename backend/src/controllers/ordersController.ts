import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DEMO_USER_ID } from '../middleware/auth.js';
import { dbProvider } from '../services/database/DatabaseProvider.js';

export async function getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const orders = await dbProvider.getOrdersByUser(userId);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const order = await dbProvider.getOrder(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order not found with id: ${id}`,
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
