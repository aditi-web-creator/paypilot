import { Router } from 'express';
import { getOrders, getOrderById } from '../controllers/ordersController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;
