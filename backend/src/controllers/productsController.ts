import { Request, Response, NextFunction } from 'express';
import { productProvider } from '../services/catalog/ProductProvider.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, category, subcategory, brand, minPrice, maxPrice, rating, inStockOnly, sort, page, limit } = req.query as any;

    let parsedBrand: string | string[] | undefined = undefined;
    if (Array.isArray(brand)) {
      parsedBrand = brand.map(String);
    } else if (typeof brand === 'string' && brand.trim()) {
      if (brand.includes(',')) {
        parsedBrand = brand.split(',').map(b => b.trim()).filter(Boolean);
      } else {
        parsedBrand = brand.trim();
      }
    }

    const result = await productProvider.getProducts({
      q: q ? String(q) : undefined,
      category: category ? String(category) : undefined,
      subcategory: subcategory ? String(subcategory) : undefined,
      brand: parsedBrand,
      minPrice: minPrice !== undefined && minPrice !== '' ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : undefined,
      rating: rating !== undefined && rating !== '' ? Number(rating) : undefined,
      inStockOnly: inStockOnly === true || inStockOnly === 'true' || inStockOnly === '1',
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

export async function getProductCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await productProvider.getTotalCount();
    return res.json({
      success: true,
      data: { total: count },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categoriesData = await productProvider.getCategories();
    return res.json({
      success: true,
      data: categoriesData.categories,
      subcategories: categoriesData.subcategories,
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
    const ids = req.body.ids || req.body.productIds;
    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide 2-4 product IDs to compare',
      });
    }
    const comparison = await productProvider.compareProducts(ids.slice(0, 4));

    return res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
}
