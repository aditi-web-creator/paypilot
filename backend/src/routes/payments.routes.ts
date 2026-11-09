import { Router } from 'express';
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
} from '../controllers/paymentsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createPayPalOrderSchema,
  capturePayPalOrderSchema,
} from '../schemas/index.js';

const router = Router();

router.use(authMiddleware);

router.post('/paypal/create-order', validateBody(createPayPalOrderSchema), createPayPalOrder);
router.post('/paypal/capture-order', validateBody(capturePayPalOrderSchema), capturePayPalOrder);
router.get('/paypal/order/:orderId', getPayPalOrder);

export default router;
