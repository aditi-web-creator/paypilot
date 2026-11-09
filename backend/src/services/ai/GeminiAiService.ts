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
  public async extractRequirements(prompt: string): Promise<ShoppingRequirements> {
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

Rules:
1. Category must match one of: "Headphones", "Laptops", "Smartphones", "Keyboards", "Smartwatches", "Monitors", "Speakers", "Tablets", "Cameras", "Accessories", or null if unspecified.
2. Budget must be an exact number. If user mentions "under $300" or "under ₹3,000" or "3000 rs" or "$60", parse the numeric amount. If user uses INR/Rupees, convert or denote currency accordingly.
3. Currency must be standard 3-letter code: "USD", "INR", "EUR", "GBP". Default to "USD" if "$" or unspecified, or "INR" if ₹ or rs or inr.
4. Preferences: an array of key technical requirements (e.g., "long battery life", "active noise cancellation", "comfortable ear cushions", "programming", "lightweight").
5. Brand preference: array of mentioned brands (e.g., "Sony", "Apple", "Dell", "Logitech") or empty array.

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
          currency: parsed.currency || 'USD',
          preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
          brand_preference: Array.isArray(parsed.brand_preference) ? parsed.brand_preference : [],
        };
      } catch (error) {
        console.warn('Gemini API extraction failed, using intelligent fallback parser:', error);
      }
    }

    // High-Accuracy Semantic Fallback Parser
    return this.fallbackExtractRequirements(prompt);
  }

  private fallbackExtractRequirements(prompt: string): ShoppingRequirements {
    const lower = prompt.toLowerCase();
    
    // 1. Detect Category
    let category: string | undefined;
    if (lower.includes('headphone') || lower.includes('earphone') || lower.includes('earbud') || lower.includes('anc')) {
      category = 'Headphones';
    } else if (lower.includes('laptop') || lower.includes('notebook') || lower.includes('macbook') || lower.includes('programming')) {
      category = 'Laptops';
    } else if (lower.includes('phone') || lower.includes('smartphone') || lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
      category = 'Smartphones';
    } else if (lower.includes('keyboard') || lower.includes('mechanical')) {
      category = 'Keyboards';
    } else if (lower.includes('watch') || lower.includes('smartwatch') || lower.includes('fitness tracker') || lower.includes('garmin')) {
      category = 'Smartwatches';
    } else if (lower.includes('monitor') || lower.includes('display') || lower.includes('screen') || lower.includes('ultrawide')) {
      category = 'Monitors';
    } else if (lower.includes('speaker') || lower.includes('soundbar') || lower.includes('audio') || lower.includes('bluetooth speaker')) {
      category = 'Speakers';
    } else if (lower.includes('tablet') || lower.includes('ipad') || lower.includes('drawing')) {
      category = 'Tablets';
    } else if (lower.includes('camera') || lower.includes('gimbal') || lower.includes('action cam') || lower.includes('vlog')) {
      category = 'Cameras';
    } else if (lower.includes('charger') || lower.includes('dock') || lower.includes('mouse') || lower.includes('hub') || lower.includes('backpack') || lower.includes('accessory')) {
      category = 'Accessories';
    }

    // 2. Detect Currency and Numeric Budget
    let budget: number | undefined;
    let currency = 'USD';

    if (lower.includes('₹') || lower.includes('inr') || lower.includes('rupee') || lower.includes('rs.')) {
      currency = 'INR';
    } else if (lower.includes('€') || lower.includes('eur')) {
      currency = 'EUR';
    } else if (lower.includes('£') || lower.includes('gbp')) {
      currency = 'GBP';
    }

    // Match numbers after under, below, max, budget, <=, $, ₹
    const budgetMatch = lower.match(/(?:under|below|max|budget|within|up to|costing|\$|₹|rs\.?)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)/i);
    if (budgetMatch && budgetMatch[1]) {
      const numStr = budgetMatch[1].replace(/,/g, '');
      budget = parseFloat(numStr);
    }

    // 3. Extract Preferences
    const preferences: string[] = [];
    const keywords = [
      'battery life', 'battery', 'noise cancellation', 'anc', 'active noise cancellation',
      'comfortable', 'cushion', 'ergonomic', 'wireless', 'bluetooth', 'lightweight',
      'portable', 'waterproof', 'swimproof', 'mechanical', 'backlight', 'rgb',
      '4k', 'oled', '120hz', 'fast charging', 'usb-c', 'camera', 'gaming', 'programming',
      'studying', 'travel', 'travelling', 'work', 'office', 'bass'
    ];

    for (const kw of keywords) {
      if (lower.includes(kw) && !preferences.includes(kw)) {
        preferences.push(kw);
      }
    }

    // 4. Extract Brand Preferences
    const knownBrands = [
      'Sony', 'Bose', 'Apple', 'Dell', 'Lenovo', 'ASUS', 'Samsung', 'Google',
      'Logitech', 'Keychron', 'Garmin', 'Anker', 'JBL', 'Canon', 'Razer'
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
    products: Product[]
  ): Promise<ProductRecommendation[]> {
    if (products.length === 0) return [];

    const recommendations: ProductRecommendation[] = products.map(product => {
      let score = 50; // base score
      const reasons: string[] = [];
      const tradeOffs: string[] = [];

      // 1. Budget Fit Evaluation
      let budgetFit: ProductRecommendation['budget_fit'] = 'well_within';
      if (reqs.budget && reqs.budget > 0) {
        // Handle currency parity approximation if reqs is INR and catalog is USD
        const effectivePrice = reqs.currency === 'INR' ? product.price * 83 : product.price;

        if (effectivePrice <= reqs.budget * 0.8) {
          budgetFit = 'well_within';
          score += 20;
          reasons.push(`Budget-Friendly: Priced at $${product.price.toFixed(2)}, comfortably within your limit.`);
        } else if (effectivePrice <= reqs.budget) {
          budgetFit = 'at_budget';
          score += 15;
          reasons.push(`Perfect Budget Match: Maximizes features right at your limit.`);
        } else if (effectivePrice <= reqs.budget * 1.15) {
          budgetFit = 'slightly_over';
          score -= 5;
          tradeOffs.push(`Slightly above target budget by ~$${(effectivePrice - reqs.budget).toFixed(2)}, but offers superior specs.`);
        } else {
          budgetFit = 'significantly_over';
          score -= 30;
          tradeOffs.push(`Exceeds specified budget.`);
        }
      }

      // 2. Preference Matching
      const fullText = `${product.name} ${product.description} ${JSON.stringify(product.specifications)}`.toLowerCase();
      let matchedPrefCount = 0;

      for (const pref of reqs.preferences) {
        if (fullText.includes(pref.toLowerCase())) {
          matchedPrefCount++;
          score += 10;
          reasons.push(`Matches requirement: "${pref}" verified in product specifications.`);
        }
      }

      // 3. Brand Matching
      if (reqs.brand_preference && reqs.brand_preference.length > 0) {
        if (reqs.brand_preference.some(b => product.brand.toLowerCase() === b.toLowerCase())) {
          score += 15;
          reasons.push(`Preferred brand: ${product.brand}`);
        }
      }

      // 4. Quality & Rating Signal
      if (product.rating >= 4.5) {
        score += 8;
        reasons.push(`High customer satisfaction: Rated ${product.rating}/5.0.`);
      }

      // 5. Stock status
      if (product.stock_status === 'in_stock') {
        score += 5;
      } else if (product.stock_status === 'low_stock') {
        tradeOffs.push('Limited stock remaining.');
      }

      // Normalize score between 10 and 99
      const finalScore = Math.min(99, Math.max(15, Math.round(score)));

      return {
        product,
        match_score: finalScore,
        match_reasons: reasons.slice(0, 4),
        budget_fit: budgetFit,
        trade_offs: tradeOffs.length > 0 ? tradeOffs : undefined,
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
