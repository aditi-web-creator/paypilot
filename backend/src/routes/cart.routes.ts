import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  validateCart,
} from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { addToCartSchema, updateCartItemSchema } from '../schemas/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', validateBody(addToCartSchema), addItem);
router.patch('/items/:id', validateBody(updateCartItemSchema), updateItem);
router.delete('/items/:id', removeItem);
router.delete('/', clearCart);
router.post('/validate', validateCart);

export default router;
