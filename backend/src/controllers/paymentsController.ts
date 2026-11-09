import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DEMO_USER_ID } from '../middleware/auth.js';
import { payPalService } from '../services/payment/PayPalService.js';
import { dbProvider } from '../services/database/DatabaseProvider.js';

export async function createPayPalOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const { currency } = req.body;

    const cart = await dbProvider.getActiveCart(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot initiate checkout for an empty cart.',
      });
    }

    const orderResult = await payPalService.createOrder(userId, cart, currency || 'USD');

    return res.status(201).json({
      success: true,
      data: orderResult,
    });
  } catch (error: any) {
    if (error.message && error.message.includes('Budget Exceeded')) {
      return res.status(422).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
}

export async function capturePayPalOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || DEMO_USER_ID;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'PayPal Order ID is required for payment capture.',
      });
    }

    const captureResult = await payPalService.captureOrder(userId, orderId);

    return res.json({
      success: true,
      data: captureResult,
    });
  } catch (error: any) {
    if (error.message && error.message.includes('Duplicate Capture')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
}

export async function getPayPalOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { orderId } = req.params;
    const details = await payPalService.getOrderDetails(orderId);

    return res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
}
