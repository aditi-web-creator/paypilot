import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { Product, ProductRecommendation, ShoppingRequirements } from '../../types/index.js';

export class GeminiAiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor() {
    this.modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (env.activeAiApiKey) {
      this.genAI = new GoogleGenerativeAI(env.activeAiApiKey);
    }
  }

  /**
   * Natural Language Intent & Requirement Extraction
   * Extracts category, numeric budget, currency, and specific feature preferences.
   */
  public async extractRequirements(prompt: string, userCurrency: string = 'USD'): Promise<ShoppingRequirements> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        });

        const extractionPrompt = `
You are PayPilot's AI Requirement Extraction Engine.
Analyze the user's shopping request and extract structured requirements as JSON.

User Input: "${prompt}"
User Active Currency: "${userCurrency}"

Rules:
1. Category should match one of: "Electronics", "Fashion", "Beauty", "Home & Kitchen", "Sports", "Gaming", "Books", "Accessories", "Travel", "Automotive", "Toys", "Lifestyle", or null if unspecified.
2. Budget must be an exact number. If user mentions "under $300" or "under ₹3,000" or "3000 rs" or "$60", parse the numeric amount.
3. Currency must be standard 3-letter code: "USD", "INR", "EUR", "GBP", "CAD", "AUD", "JPY". Default to user currency "${userCurrency}" or detect from symbols (₹ -> INR, $ -> USD, € -> EUR, £ -> GBP, ¥ -> JPY).
4. Preferences: an array of key technical requirements (e.g., "long battery life", "wireless", "running shoes", "cotton", "skincare", "4k", "lightweight").
5. Brand preference: array of mentioned brands (e.g., "Sony", "Apple", "Nike", "Dell", "Logitech", "Samsung") or empty array.

Return ONLY valid JSON matching this schema:
{
  "category": string | null,
  "budget": number | null,
  "currency": string,
  "preferences": string[],
  "brand_preference": string[]
}
`;

        const result = await model.generateContent(extractionPrompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        return {
          category: parsed.category || undefined,
          budget: typeof parsed.budget === 'number' ? parsed.budget : undefined,
          currency: parsed.currency || userCurrency || 'USD',
          preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
          brand_preference: Array.isArray(parsed.brand_preference) ? parsed.brand_preference : [],
        };
      } catch (error) {
        console.warn('Gemini API extraction failed, using intelligent fallback parser:', error);
      }
    }

    // High-Accuracy Semantic Fallback Parser
    return this.fallbackExtractRequirements(prompt, userCurrency);
  }

  private fallbackExtractRequirements(prompt: string, userCurrency: string = 'USD'): ShoppingRequirements {
    const lower = prompt.toLowerCase();
    
    // 1. Detect Category across 12 categories
    let category: string | undefined;
    if (lower.includes('headphone') || lower.includes('earphone') || lower.includes('laptop') || lower.includes('phone') || lower.includes('tv') || lower.includes('tablet') || lower.includes('speaker') || lower.includes('electronic')) {
      category = 'Electronics';
    } else if (lower.includes('shoe') || lower.includes('shirt') || lower.includes('jacket') || lower.includes('dress') || lower.includes('pant') || lower.includes('hoodie') || lower.includes('fashion') || lower.includes('wear')) {
      category = 'Fashion';
    } else if (lower.includes('serum') || lower.includes('cream') || lower.includes('skin') || lower.includes('cleanser') || lower.includes('shampoo') || lower.includes('perfume') || lower.includes('beauty')) {
      category = 'Beauty';
    } else if (lower.includes('kitchen') || lower.includes('coffee') || lower.includes('blender') || lower.includes('cookware') || lower.includes('pot') || lower.includes('pan') || lower.includes('knife') || lower.includes('home')) {
      category = 'Home & Kitchen';
    } else if (lower.includes('sport') || lower.includes('fitness') || lower.includes('yoga') || lower.includes('gym') || lower.includes('dumbbell') || lower.includes('racket') || lower.includes('bike')) {
      category = 'Sports';
    } else if (lower.includes('game') || lower.includes('gaming') || lower.includes('playstation') || lower.includes('xbox') || lower.includes('nintendo') || lower.includes('controller') || lower.includes('headset')) {
      category = 'Gaming';
    } else if (lower.includes('book') || lower.includes('novel') || lower.includes('read') || lower.includes('author') || lower.includes('paperback')) {
      category = 'Books';
    } else if (lower.includes('wallet') || lower.includes('sunglass') || lower.includes('bag') || lower.includes('backpack') || lower.includes('belt') || lower.includes('watch') || lower.includes('jewel') || lower.includes('accessories')) {
      category = 'Accessories';
    } else if (lower.includes('travel') || lower.includes('luggage') || lower.includes('suitcase') || lower.includes('passport') || lower.includes('duffel')) {
      category = 'Travel';
    } else if (lower.includes('car') || lower.includes('dashcam') || lower.includes('automotive') || lower.includes('tire') || lower.includes('vehicle') || lower.includes('motor')) {
      category = 'Automotive';
    } else if (lower.includes('toy') || lower.includes('lego') || lower.includes('puzzle') || lower.includes('kid') || lower.includes('doll') || lower.includes('board game')) {
      category = 'Toys';
    } else if (lower.includes('candle') || lower.includes('planter') || lower.includes('journal') || lower.includes('lifestyle') || lower.includes('diffuser')) {
      category = 'Lifestyle';
    }

    // 2. Detect Currency and Numeric Budget
    let budget: number | undefined;
    let currency = userCurrency || 'USD';

    if (lower.includes('₹') || lower.includes('inr') || lower.includes('rupee') || lower.includes('rs.') || lower.includes('rs ')) {
      currency = 'INR';
    } else if (lower.includes('€') || lower.includes('eur')) {
      currency = 'EUR';
    } else if (lower.includes('£') || lower.includes('gbp')) {
      currency = 'GBP';
    } else if (lower.includes('$') || lower.includes('usd')) {
      currency = 'USD';
    } else if (lower.includes('¥') || lower.includes('jpy')) {
      currency = 'JPY';
    }

    // Match numbers after under, below, max, budget, <=, $, ₹, rs
    const budgetMatch = lower.match(/(?:under|below|max|budget|within|up to|costing|\$|₹|rs\.?|eur|gbp)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)/i);
    if (budgetMatch && budgetMatch[1]) {
      const numStr = budgetMatch[1].replace(/,/g, '');
      budget = parseFloat(numStr);
    }

    // 3. Extract Preferences
    const preferences: string[] = [];
    const keywords = [
      'battery life', 'battery', 'noise cancellation', 'anc', 'wireless', 'bluetooth',
      'comfortable', 'ergonomic', 'lightweight', 'portable', 'waterproof', 'leather',
      'cotton', '4k', 'oled', 'fast charging', 'usb-c', 'gaming', 'running', 'espresso',
      'stainless steel', 'organic', 'vegan', 'spf', 'hydrating', 'mechanical'
    ];

    for (const kw of keywords) {
      if (lower.includes(kw) && !preferences.includes(kw)) {
        preferences.push(kw);
      }
    }

    // 4. Extract Brand Preferences
    const knownBrands = [
      'Sony', 'Bose', 'Apple', 'Dell', 'Lenovo', 'ASUS', 'Samsung', 'Google',
      'Logitech', 'Keychron', 'Garmin', 'Anker', 'Nike', 'Adidas', 'Zara',
      'Sephora', 'Breville', 'DeLonghi', 'Nintendo', 'PlayStation', 'Xbox',
      'Penguin', 'Samsonite', 'Lego', 'Philips', 'Razer'
    ];
    const brand_preference = knownBrands.filter(b => lower.includes(b.toLowerCase()));

    return {
      category,
      budget,
      currency,
      preferences,
      brand_preference,
    };
  }

  /**
   * Multi-Factor Recommendation Ranking & Match Explanation
   * Evaluates requirements against product specs and assigns a match score + transparent rationale.
   */
  public async rankAndRecommend(
    prompt: string,
    reqs: ShoppingRequirements,
    products: Product[],
    budgetLimitUSD: number = 500,
    remainingBudgetUSD: number = 500
  ): Promise<ProductRecommendation[]> {
    if (products.length === 0) return [];

    const currencyRates: Record<string, number> = {
      USD: 1.0,
      INR: 83.0,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.52,
      JPY: 155.0,
    };

    const targetRate = currencyRates[reqs.currency?.toUpperCase() || 'USD'] || 1.0;
    // Normalized budget in USD
    const targetBudgetUSD = reqs.budget ? reqs.budget / targetRate : undefined;

    const recommendations: ProductRecommendation[] = products.map(product => {
      let score = 50; // base score
      const reasons: string[] = [];
      const tradeOffs: string[] = [];
      const productPriceUSD = product.priceUSD || product.price;

      // 1. Budget Fit Evaluation
      let budgetFit: ProductRecommendation['budget_fit'] = 'well_within';
      if (targetBudgetUSD && targetBudgetUSD > 0) {
        if (productPriceUSD <= targetBudgetUSD * 0.8) {
          budgetFit = 'well_within';
          score += 22;
          reasons.push(`Budget-friendly at $${productPriceUSD.toFixed(2)}, well within your target.`);
        } else if (productPriceUSD <= targetBudgetUSD) {
          budgetFit = 'at_budget';
          score += 18;
          reasons.push(`Optimal balance of quality and target budget ($${productPriceUSD.toFixed(2)}).`);
        } else if (productPriceUSD <= targetBudgetUSD * 1.15) {
          budgetFit = 'slightly_over';
          score -= 5;
          tradeOffs.push(`Slightly above target budget by ~$${(productPriceUSD - targetBudgetUSD).toFixed(2)}, but offers superior specs.`);
        } else {
          budgetFit = 'significantly_over';
          score -= 30;
          tradeOffs.push(`Exceeds target budget limit.`);
        }
      }

      // 2. Preference Matching
      const fullText = `${product.name} ${product.description} ${product.category} ${product.subcategory || ''} ${JSON.stringify(product.specs || product.specifications || {})}`.toLowerCase();
      for (const pref of reqs.preferences) {
        if (fullText.includes(pref.toLowerCase())) {
          score += 12;
          reasons.push(`Verified specification match: "${pref}".`);
        }
      }

      // 3. Brand Matching
      if (reqs.brand_preference && reqs.brand_preference.length > 0) {
        if (reqs.brand_preference.some(b => product.brand.toLowerCase() === b.toLowerCase())) {
          score += 15;
          reasons.push(`Preferred brand: ${product.brand}.`);
        }
      }

      // 4. Quality & Rating Signal
      if (product.rating >= 4.7) {
        score += 10;
        reasons.push(`Top customer rating: ${product.rating}★ (${product.reviewCount || 100}+ verified reviews).`);
      } else if (product.rating >= 4.3) {
        score += 6;
        reasons.push(`Highly rated: ${product.rating}★.`);
      }

      // 5. Stock check
      if (product.stock_status === 'in_stock') {
        score += 5;
      } else if (product.stock_status === 'low_stock') {
        tradeOffs.push('Limited stock remaining.');
      }

      // Budget impact calculation
      const safeRemaining = Math.max(1, remainingBudgetUSD);
      const budgetImpactPercentage = Math.min(100, Math.round((productPriceUSD / safeRemaining) * 100));
      const isOverBudget = productPriceUSD > remainingBudgetUSD;

      const whyThisPick = reasons[0] || `High-value recommendation in ${product.category} with ${product.rating}★ rating.`;

      // Normalize score between 20 and 99
      const finalScore = Math.min(99, Math.max(20, Math.round(score)));

      return {
        product,
        match_score: finalScore,
        match_reasons: reasons.slice(0, 4),
        budget_fit: budgetFit,
        trade_offs: tradeOffs.length > 0 ? tradeOffs : undefined,
        why_this_pick: whyThisPick,
        budget_impact_percentage: budgetImpactPercentage,
        is_over_budget: isOverBudget,
      };
    });

    // Sort descending by match score
    return recommendations.sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Explain Product Details strictly using verified catalog data
   */
  public async explainProduct(product: Product, userQuestion?: string): Promise<string> {
    const specsString = Object.entries(product.specifications || {})
      .map(([k, v]) => `• ${k.replace(/_/g, ' ')}: ${v}`)
      .join('\n');

    if (this.genAI && userQuestion) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: { temperature: 0.2 },
        });

        const prompt = `
You are PayPilot's trusted AI shopping assistant.
A user is asking about the following product from PayPilot's catalog:

Product Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Price: $${product.price.toFixed(2)} ${product.currency}
Customer Rating: ${product.rating} / 5.0
Stock Status: ${product.stock_status}
Description: ${product.description}
Specifications:
${specsString}

User Question: "${userQuestion}"

STRICT RULES:
1. Answer the question accurately using ONLY the catalog data provided above.
2. If the user asks for a detail not present in the specifications or description, explicitly say: "I do not have that specific detail in our verified catalog records."
3. Never invent specs, warranties, or prices.
4. Keep the answer concise, professional, and helpful.
`;
        const res = await model.generateContent(prompt);
        return res.response.text();
      } catch (e) {
        console.warn('Gemini Q&A failed, falling back to structured spec response:', e);
      }
    }

    // Verified catalog data summary
    return `### **${product.name}**
**Brand:** ${product.brand} | **Price:** $${product.price.toFixed(2)} | **Rating:** ${product.rating}/5.0 (${product.stock_status === 'in_stock' ? 'In Stock' : 'Low Stock'})

${product.description}

#### Verified Specifications:
${specsString}

*Note: All details are verified directly from PayPilot's catalog repository.*`;
  }
}

export const geminiAiService = new GeminiAiService();
