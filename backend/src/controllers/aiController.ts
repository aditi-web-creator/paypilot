import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DEMO_USER_ID } from '../middleware/auth.js';
import { shoppingAgent } from '../agents/shoppingAgent.js';
import { geminiAiService } from '../services/ai/GeminiAiService.js';
import { productProvider } from '../services/catalog/ProductProvider.js';

export async function chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || req.body.userId || DEMO_USER_ID;
    const { message, sessionId, userName, currency, monthlyLimitUSD, currentSpendUSD } = req.body;

    const agentResult = await shoppingAgent.processUserMessage(userId, message, sessionId, {
      userName,
      currency,
      monthlyLimitUSD,
      currentSpendUSD,
    });

    return res.json({
      success: true,
      data: agentResult,
    });
  } catch (error) {
    next(error);
  }
}

export async function extractRequirements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    const requirements = await shoppingAgent.extractShoppingRequirements(prompt);

    return res.json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { prompt, requirements, candidateIds } = req.body;
    let candidates: any[] = [];

    if (Array.isArray(candidateIds) && candidateIds.length > 0) {
      for (const id of candidateIds) {
        const p = await productProvider.getProductById(id);
        if (p) candidates.push(p);
      }
    } else {
      candidates = await shoppingAgent.searchProducts(prompt || requirements?.category || '', 10);
    }

    const recommendations = await geminiAiService.rankAndRecommend(prompt, requirements, candidates);

    return res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductDetailsAndQA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { productId, productName, question } = req.body;
    const identifier = productId || productName;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Either productId or productName must be provided.',
      });
    }

    const product = await shoppingAgent.getProductDetails(identifier);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found in catalog: ${identifier}`,
      });
    }

    const explanation = await shoppingAgent.explainRecommendation(product, question);

    return res.json({
      success: true,
      data: {
        product,
        explanation,
      },
    });
  } catch (error) {
    next(error);
  }
}
