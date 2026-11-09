import { Router } from 'express';
import { getDashboardSummary, getSpendingAnalytics } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getDashboardSummary);
router.get('/spending', getSpendingAnalytics);

export default router;
