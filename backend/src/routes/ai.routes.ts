import { Router } from 'express';
import {
  chat,
  extractRequirements,
  getRecommendations,
  getProductDetailsAndQA,
} from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  chatMessageSchema,
  extractRequirementsSchema,
  productDetailsQuerySchema,
} from '../schemas/index.js';

const router = Router();

router.use(authMiddleware);

router.post('/chat', validateBody(chatMessageSchema), chat);
router.post('/extract-requirements', validateBody(extractRequirementsSchema), extractRequirements);
router.post('/recommendations', getRecommendations);
router.post('/product-details', validateBody(productDetailsQuerySchema), getProductDetailsAndQA);

export default router;
