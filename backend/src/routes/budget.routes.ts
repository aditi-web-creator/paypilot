import { Router } from 'express';
import { getBudget, updateBudget } from '../controllers/budgetController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateBudgetSchema } from '../schemas/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getBudget);
router.put('/', validateBody(updateBudgetSchema), updateBudget);

export default router;
