import { Router } from 'express';
import {
  getProducts,
  getCategories,
  getBrands,
  getProductById,
  searchProducts,
  compareProducts,
  getProductCount,
} from '../controllers/productsController.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { productCompareSchema, productQuerySchema } from '../schemas/index.js';

const router = Router();

router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/count', getProductCount);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id', getProductById);
router.post('/search', searchProducts);
router.post('/compare', validateBody(productCompareSchema), compareProducts);

export default router;
