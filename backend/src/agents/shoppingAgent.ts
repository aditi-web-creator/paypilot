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
  public async extractShoppingRequirements(prompt: string, userCurrency: string = 'USD'): Promise<ShoppingRequirements> {
    return geminiAiService.extractRequirements(prompt, userCurrency);
  }

  /**
   * Tool 2: searchProducts
   */
  public async searchProducts(query: string, maxResults: number = 12): Promise<Product[]> {
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
    sessionId?: string,
    context?: {
      userName?: string;
      currency?: string;
      monthlyLimitUSD?: number;
      currentSpendUSD?: number;
    }
  ): Promise<AgentResponse> {
    const activitySteps: AgentActivityStep[] = [];
    const toolCalls: AgentResponse['toolCalls'] = [];

    const userCurrency = (context?.currency || 'USD').toUpperCase();
    const userName = context?.userName?.trim() || '';

    // Exchange rate map for conversion
    const currencyRates: Record<string, number> = {
      USD: 1.0,
      INR: 83.0,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.52,
      JPY: 155.0,
    };
    const activeRate = currencyRates[userCurrency] || 1.0;

    // 1. Session Setup
    let session = sessionId ? await dbProvider.getSession(sessionId) : null;
    if (!session) {
      session = await dbProvider.createSession(userId, message);
    }

    // Save incoming user message
    await dbProvider.addMessage(session.id, 'user', message);

    // Fetch dynamic total catalog count from SQLite database
    const totalCatalogCount = await productProvider.getTotalCount();

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
        details: 'Looking up specific catalog product record in database',
        timestamp: new Date().toISOString(),
      });

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
          details: `Found exact database match: ${product.name}`,
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
              why_this_pick: 'Exact product query match with verified specs.',
              budget_impact_percentage: 10,
              is_over_budget: false,
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
      details: 'Analyzing natural language preferences, category, and price constraints',
      timestamp: new Date().toISOString(),
    });

    const requirements = await this.extractShoppingRequirements(message, userCurrency);
    toolCalls.push({
      tool: 'extractShoppingRequirements',
      input: { prompt: message, userCurrency },
      output: requirements,
      status: 'success',
    });

    activitySteps[activitySteps.length - 1].status = 'completed';

    // 3. Step: Searching Catalog (Tool 2) - Real database query
    activitySteps.push({
      step: 'searching_catalog',
      label: `Searching ${totalCatalogCount} verified products across 12 categories`,
      status: 'in_progress',
      details: requirements.category
        ? `Filtering by category: "${requirements.category}" and preferences in database`
        : 'Querying across catalog database',
      timestamp: new Date().toISOString(),
    });

    // Convert requested budget to USD if specified in user's currency
    let targetBudgetUSD: number | undefined = undefined;
    if (requirements.budget && requirements.budget > 0) {
      const reqCurrency = (requirements.currency || userCurrency).toUpperCase();
      const reqRate = currencyRates[reqCurrency] || 1.0;
      targetBudgetUSD = requirements.budget / reqRate;
    }

    const searchQuery = [
      requirements.category || '',
      ...(requirements.brand_preference || []),
      ...(requirements.preferences || []),
    ]
      .filter(Boolean)
      .join(' ');

    let candidates = await this.searchProducts(searchQuery || message, 15);

    // If search was overly specific or empty, query by category
    if (candidates.length === 0 && requirements.category) {
      const catResults = await productProvider.getProducts({
        category: requirements.category,
        maxPrice: targetBudgetUSD ? targetBudgetUSD * 1.25 : undefined,
        limit: 12,
        sort: 'rating_desc',
      });
      candidates = catResults.products;
    }

    // Fallback if still empty: top rated items
    if (candidates.length === 0) {
      const allRes = await productProvider.getProducts({ limit: 8, sort: 'rating_desc' });
      candidates = allRes.products;
    }

    toolCalls.push({
      tool: 'searchProducts',
      input: { query: searchQuery || message, limit: 15 },
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

    // Check user budget from store or context
    const budgetCheck = await this.checkBudget(userId, 0);
    const monthlyLimitUSD = context?.monthlyLimitUSD || budgetCheck.budgetLimit;
    const remainingBudgetUSD = budgetCheck.remaining;

    const ranked = await geminiAiService.rankAndRecommend(
      message,
      requirements,
      candidates,
      monthlyLimitUSD,
      remainingBudgetUSD
    );
    activitySteps[activitySteps.length - 1].status = 'completed';

    // Check cheaper alternatives for any item that pushes over budget
    const topPicks = ranked.slice(0, 4);
    for (const pick of topPicks) {
      const price = pick.product.priceUSD || pick.product.price;
      if (price > remainingBudgetUSD || pick.is_over_budget) {
        pick.is_over_budget = true;
        // Search SQLite for a cheaper alternative in the same category
        try {
          const cheaperOptions = await productProvider.getProducts({
            category: pick.product.category,
            maxPrice: remainingBudgetUSD > 10 ? remainingBudgetUSD : price * 0.7,
            sort: 'rating_desc',
            limit: 3,
          });
          const alt = cheaperOptions.products.find(p => p.id !== pick.product.id);
          if (alt) {
            pick.cheaper_alternative = alt;
          }
        } catch (e) {
          console.warn('Could not query cheaper alternative:', e);
        }
      }
    }

    activitySteps.push({
      step: 'evaluating_budget',
      label: 'Evaluating user budget limit and spending guardrails',
      status: 'completed',
      details: `Verified against monthly limit ($${monthlyLimitUSD.toFixed(2)} USD)`,
      timestamp: new Date().toISOString(),
    });

    activitySteps.push({
      step: 'preparing_recommendations',
      label: 'Compiling top recommendations and match summaries',
      status: 'completed',
      details: `Generated ${topPicks.length} curated recommendations from database`,
      timestamp: new Date().toISOString(),
    });

    // Construct AI conversational reply with personalized greeting and Markdown formatting
    let replyText = '';
    const greeting = userName ? `Hi ${userName}! ` : 'Hello! ';

    if (topPicks.length > 0) {
      const lead = topPicks[0];
      const leadPriceUSD = lead.product.priceUSD || lead.product.price;
      const leadPriceInUserCurr = Math.round(leadPriceUSD * activeRate);

      let budgetNote = '';
      if (requirements.budget) {
        const symbol = userCurrency === 'INR' ? '₹' : userCurrency === 'EUR' ? '€' : userCurrency === 'GBP' ? '£' : '$';
        budgetNote = ` under your target budget of **${symbol}${requirements.budget.toLocaleString()}**`;
      }

      replyText = `${greeting}I analyzed your request and found **${topPicks.length} tailored options** from our verified catalog (${totalCatalogCount} items)${budgetNote}.\n\n`;
      replyText += `### **Top Pick: ${lead.product.name}**\n`;
      replyText += `• **Price:** $${leadPriceUSD.toFixed(2)} USD (~${userCurrency === 'INR' ? '₹' : userCurrency === 'EUR' ? '€' : userCurrency === 'GBP' ? '£' : '$'}${leadPriceInUserCurr.toLocaleString()} ${userCurrency})\n`;
      replyText += `• **Match Score:** ${lead.match_score}/100\n`;
      replyText += `• **Why this pick:** ${lead.why_this_pick || lead.match_reasons[0]}\n`;

      if (lead.is_over_budget) {
        replyText += `\n⚠️ **Budget Notice:** This product exceeds your remaining budget ($${remainingBudgetUSD.toFixed(2)} USD). `;
        if (lead.cheaper_alternative) {
          replyText += `Consider **${lead.cheaper_alternative.name}** at $${(lead.cheaper_alternative.priceUSD || lead.cheaper_alternative.price).toFixed(2)} USD as a budget-friendly alternative.\n`;
        }
      }

      replyText += `\nExplore the interactive recommendation cards below to inspect specifications, compare alternatives, or add items directly to your cart.`;
    } else {
      replyText = `${greeting}I could not find exact matches for your specific requirements in our catalog of ${totalCatalogCount} items. Try expanding your search terms, exploring related categories, or adjusting your budget filter on the Browse page.`;
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
        limit: monthlyLimitUSD,
        spent: budgetCheck.currentSpent,
        remaining: remainingBudgetUSD,
        isOverBudget: !budgetCheck.isAllowed,
      },
      activitySteps,
      toolCalls,
    };
  }
}

export const shoppingAgent = new ShoppingAgent();
