import { Request, Response, NextFunction } from 'express';
import { productProvider } from '../services/catalog/ProductProvider.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, category, brand, minPrice, maxPrice, sort, page, limit } = req.query as any;

    const result = await productProvider.getProducts({
      q: q ? String(q) : undefined,
      category: category ? String(category) : undefined,
      brand: brand ? String(brand) : undefined,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      sort: sort as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await productProvider.getCategories();
    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const brands = await productProvider.getBrands(category);
    return res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await productProvider.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found with id: ${id}`,
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { query, limit } = req.body;
    const products = await productProvider.searchProducts(query || '', limit ? Number(limit) : 10);

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function compareProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { productIds } = req.body;
    const comparison = await productProvider.compareProducts(productIds);

    return res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
}
