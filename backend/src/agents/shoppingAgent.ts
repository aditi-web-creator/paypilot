import { productProvider, ProductQueryOptions } from '../services/catalog/ProductProvider.js';
import { dbProvider } from '../services/database/DatabaseProvider.js';
import { geminiAiService } from '../services/ai/GeminiAiService.js';
import {
  AgentActivityStep,
  Cart,
  Product,
  ProductRecommendation,
  ShoppingRequirements,
} from '../types/index.js';

export interface AgentResponse {
  sessionId: string;
  reply: string;
  requirements?: ShoppingRequirements;
  recommendations: ProductRecommendation[];
  cart?: Cart;
  budgetStatus?: {
    limit: number;
    spent: number;
    remaining: number;
    isOverBudget: boolean;
  };
  activitySteps: AgentActivityStep[];
  toolCalls: { tool: string; input: any; output: any; status: 'success' | 'error' }[];
}

export class ShoppingAgent {
  /**
   * Tool 1: extractShoppingRequirements
   */
  public async extractShoppingRequirements(prompt: string): Promise<ShoppingRequirements> {
    return geminiAiService.extractRequirements(prompt);
  }

  /**
   * Tool 2: searchProducts
   */
  public async searchProducts(query: string, maxResults: number = 8): Promise<Product[]> {
    return productProvider.searchProducts(query, maxResults);
  }

  /**
   * Tool 3: compareProducts
   */
  public async compareProducts(productIds: string[]): Promise<any> {
    return productProvider.compareProducts(productIds);
  }

  /**
   * Tool 4: explainRecommendation
   */
  public async explainRecommendation(product: Product, question?: string): Promise<string> {
    return geminiAiService.explainProduct(product, question);
  }

  /**
   * Tool 5: checkBudget
   */
  public async checkBudget(userId: string, additionalAmount: number = 0): Promise<{
    budgetLimit: number;
    currentSpent: number;
    remaining: number;
    projectedSpent: number;
    isAllowed: boolean;
    reason?: string;
  }> {
    const budget = await dbProvider.getBudget(userId);
    const summary = await dbProvider.getSpendingSummary(userId);
    const projected = summary.total_spent + additionalAmount;
    const isAllowed = projected <= budget.budget_limit;

    return {
      budgetLimit: budget.budget_limit,
      currentSpent: summary.total_spent,
      remaining: summary.remaining_budget,
      projectedSpent: projected,
      isAllowed,
      reason: isAllowed
        ? undefined
        : `Cart total would exceed authorized budget of $${budget.budget_limit.toFixed(2)} by $${(
            projected - budget.budget_limit
          ).toFixed(2)}.`,
    };
  }

  /**
   * Tool 6: prepareCart
   */
  public async prepareCart(userId: string, productIds: string[]): Promise<Cart> {
    // Clear and prepare fresh cart for selected recommendation
    await dbProvider.clearCart(userId);
    for (const pid of productIds) {
      await dbProvider.addItemToCart(userId, pid, 1);
    }
    return dbProvider.getActiveCart(userId);
  }

  /**
   * Tool 7: getCartSummary
   */
  public async getCartSummary(userId: string): Promise<Cart> {
    return dbProvider.getActiveCart(userId);
  }

  /**
   * Tool 8: getProductDetails
   * Returns full record for any product by ID or name strictly from catalog data
   */
  public async getProductDetails(identifier: string): Promise<Product | null> {
    let p = await productProvider.getProductById(identifier);
    if (!p) {
      p = await productProvider.getProductByName(identifier);
    }
    return p;
  }

  /**
   * Tool 9: browseCatalog
   * Filtered, paginated listing across ALL products, not just a requirement-matched subset
   */
  public async browseCatalog(options: ProductQueryOptions = {}): Promise<any> {
    return productProvider.getProducts(options);
  }

  /**
   * Primary Autonomous Processing Pipeline
   */
  public async processUserMessage(
    userId: string,
    message: string,
    sessionId?: string
  ): Promise<AgentResponse> {
    const activitySteps: AgentActivityStep[] = [];
    const toolCalls: AgentResponse['toolCalls'] = [];

    // 1. Session Setup
    let session = sessionId ? await dbProvider.getSession(sessionId) : null;
    if (!session) {
      session = await dbProvider.createSession(userId, message);
    }

    // Save incoming user message
    await dbProvider.addMessage(session.id, 'user', message);

    // Check if the user is asking specifically about a single product in catalog
    const lowerMessage = message.toLowerCase();
    const isSpecificProductQuery =
      lowerMessage.startsWith('tell me about') ||
      lowerMessage.startsWith('what is') ||
      lowerMessage.startsWith('does this have') ||
      lowerMessage.includes('product details') ||
      lowerMessage.includes('specs for');

    if (isSpecificProductQuery) {
      activitySteps.push({
        step: 'understanding_requirements',
        label: 'Analyzing product inquiry',
        status: 'completed',
        details: 'Looking up specific catalog product record',
        timestamp: new Date().toISOString(),
      });

      // Extract product identifier
      const cleanTarget = message
        .replace(/tell me about|what is|does this have|product details for|specs for/gi, '')
        .trim();

      const product = await this.getProductDetails(cleanTarget);
      toolCalls.push({
        tool: 'getProductDetails',
        input: { identifier: cleanTarget },
        output: product ? { id: product.id, name: product.name, price: product.price } : null,
        status: 'success',
      });

      if (product) {
        activitySteps.push({
          step: 'searching_catalog',
          label: 'Catalog lookup verified',
          status: 'completed',
          details: `Found exact match: ${product.name}`,
          timestamp: new Date().toISOString(),
        });

        const explanation = await this.explainRecommendation(product, message);
        await dbProvider.addMessage(session.id, 'assistant', explanation, toolCalls);

        return {
          sessionId: session.id,
          reply: explanation,
          recommendations: [
            {
              product,
              match_score: 98,
              match_reasons: ['Direct catalog query match', `Price: $${product.price.toFixed(2)}`],
              budget_fit: 'well_within',
            },
          ],
          activitySteps,
          toolCalls,
        };
      }
    }

    // 2. Step: Understanding Requirements (Tool 1)
    activitySteps.push({
      step: 'understanding_requirements',
      label: 'Extracting shopping requirements & budget',
      status: 'in_progress',
      details: 'Analyzing natural language preferences and price constraints',
      timestamp: new Date().toISOString(),
    });

    const requirements = await this.extractShoppingRequirements(message);
    toolCalls.push({
      tool: 'extractShoppingRequirements',
      input: { prompt: message },
      output: requirements,
      status: 'success',
    });

    activitySteps[activitySteps.length - 1].status = 'completed';

    // 3. Step: Searching Catalog (Tool 2)
    activitySteps.push({
      step: 'searching_catalog',
      label: 'Searching 160+ verified catalog products',
      status: 'in_progress',
      details: requirements.category
        ? `Filtering by category: "${requirements.category}" and preferences`
        : 'Querying across catalog categories',
      timestamp: new Date().toISOString(),
    });

    const searchQuery = [
      requirements.category || '',
      ...(requirements.brand_preference || []),
      ...(requirements.preferences || []),
    ]
      .filter(Boolean)
      .join(' ');

    let candidates = await this.searchProducts(searchQuery || message, 12);

    // If search was overly specific, fallback to category search
    if (candidates.length === 0 && requirements.category) {
      candidates = await this.searchProducts(requirements.category, 8);
    }

    // If still no products found, pull top rated items
    if (candidates.length === 0) {
      const allRes = await productProvider.getProducts({ limit: 6, sort: 'rating_desc' });
      candidates = allRes.products;
    }

    toolCalls.push({
      tool: 'searchProducts',
      input: { query: searchQuery || message, limit: 12 },
      output: candidates.map(c => ({ id: c.id, name: c.name, price: c.price })),
      status: 'success',
    });

    activitySteps[activitySteps.length - 1].status = 'completed';

    // 4. Step: Comparing & Ranking Recommendations (Tool 3 & 4)
    activitySteps.push({
      step: 'comparing_products',
      label: 'Comparing technical specifications & match criteria',
      status: 'in_progress',
      details: `Scoring ${candidates.length} candidate items against requested criteria`,
      timestamp: new Date().toISOString(),
    });

    const ranked = await geminiAiService.rankAndRecommend(message, requirements, candidates);
    activitySteps[activitySteps.length - 1].status = 'completed';

    activitySteps.push({
      step: 'evaluating_budget',
      label: 'Evaluating user budget limit and spending guardrails',
      status: 'in_progress',
      details: 'Checking compatibility with financial constraints',
      timestamp: new Date().toISOString(),
    });

    // 5. Budget Check (Tool 5)
    const topCandidate = ranked[0];
    const budgetCheck = await this.checkBudget(userId, topCandidate ? topCandidate.product.price : 0);
    toolCalls.push({
      tool: 'checkBudget',
      input: { userId, amount: topCandidate?.product.price || 0 },
      output: budgetCheck,
      status: 'success',
    });

    activitySteps[activitySteps.length - 1].status = 'completed';

    // 6. Preparing Recommendations
    activitySteps.push({
      step: 'preparing_recommendations',
      label: 'Compiling top recommendations and match summaries',
      status: 'completed',
      details: `Generated ${Math.min(4, ranked.length)} curated recommendations`,
      timestamp: new Date().toISOString(),
    });

    // Construct AI conversational reply
    let replyText = '';
    const topPicks = ranked.slice(0, 4);

    if (topPicks.length > 0) {
      const lead = topPicks[0];
      replyText = `I analyzed your request and found **${topPicks.length} great options** from our verified catalog`;

      if (requirements.budget) {
        replyText += ` under your target budget of **$${requirements.budget}**`;
      }
      replyText += `.\n\n### **Top Recommendation: ${lead.product.name}**\n`;
      replyText += `• **Price:** $${lead.product.price.toFixed(2)} (${lead.budget_fit.replace('_', ' ')})\n`;
      replyText += `• **Match Score:** ${lead.match_score}/100\n`;
      if (lead.match_reasons.length > 0) {
        replyText += `• **Why It Fits:** ${lead.match_reasons.join(' ')}\n`;
      }
      if (lead.trade_offs && lead.trade_offs.length > 0) {
        replyText += `• **Consideration:** ${lead.trade_offs.join(' ')}\n`;
      }

      replyText += `\nYou can review the specifications on the right, compare them, or click **"Add to Cart"** to prepare your order for checkout.`;
    } else {
      replyText = `We couldn't find products matching all your specific requirements. Try adjusting your budget or preferences, or browse our full 160-item catalog on the Browse Products page.`;
    }

    // Persist assistant message in database
    await dbProvider.addMessage(session.id, 'assistant', replyText, toolCalls, topPicks);

    // Update session requirements
    await dbProvider.updateSession(session.id, {
      extracted_requirements: requirements,
      budget: requirements.budget,
    });

    const activeCart = await dbProvider.getActiveCart(userId);

    return {
      sessionId: session.id,
      reply: replyText,
      requirements,
      recommendations: topPicks,
      cart: activeCart,
      budgetStatus: {
        limit: budgetCheck.budgetLimit,
        spent: budgetCheck.currentSpent,
        remaining: budgetCheck.remaining,
        isOverBudget: !budgetCheck.isAllowed,
      },
      activitySteps,
      toolCalls,
    };
  }
}

export const shoppingAgent = new ShoppingAgent();
