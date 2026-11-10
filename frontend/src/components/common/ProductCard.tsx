import React from 'react';
import { Product, ProductRecommendation } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { ShoppingCart, Star, Eye, ArrowRightLeft, Sparkles, CheckCircle2, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatMoney } from '../../utils/currency';

export interface ProductCardProps {
  product: Product;
  recommendation?: ProductRecommendation;
  onViewDetails?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  onAskAi?: (product: Product) => void;
  isComparing?: boolean;
}

export const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  Fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
  Beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  Sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
  Gaming: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  Books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
  Accessories: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
  Travel: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  Automotive: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
  Toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
  Lifestyle: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  recommendation,
  onViewDetails,
  onCompare,
  onAskAi,
  isComparing,
}) => {
  const { addToCart } = useCart();
  const { currency } = useSettings();
  const [isAdding, setIsAdding] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  const priceUSD = product.priceUSD || product.price;
  const originalPriceUSD = product.originalPriceUSD;
  const imageUrl = product.imageUrl || product.image_url;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const fallbackImage = CATEGORY_PLACEHOLDERS[product.category] ||
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  const budgetImpact = recommendation?.budget_impact_percent ?? recommendation?.budget_impact_percentage;
  const whyThisPick = recommendation?.why_this_pick || (recommendation?.match_reasons && recommendation.match_reasons[0]);
  const isOverBudget = recommendation?.is_over_budget;
  const cheaperAlt = recommendation?.cheaper_alternative;

  return (
    <div className="group bg-white rounded-card border border-slate-200 shadow-subtle hover:shadow-elevated hover:border-emerald-300 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={imageUrl || fallbackImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <Badge variant="gray" size="sm" className="backdrop-blur-md bg-white/90">
            {product.category}
          </Badge>
          {recommendation && (
            <Badge variant="emerald" size="sm" className="font-bold shadow-sm">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {recommendation.match_score}% Match
            </Badge>
          )}
          {isOverBudget && (
            <Badge variant="error" size="sm" className="font-bold shadow-sm flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              Over Budget
            </Badge>
          )}
        </div>

        {/* Rating and Stock */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
          <span className="inline-flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-800 shadow-sm border border-slate-200/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
            {product.reviewCount ? ` (${product.reviewCount})` : ''}
          </span>
          {product.stock_status === 'low_stock' && (
            <Badge variant="warning" size="sm">
              Low Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{product.brand}</span>
            {product.subcategory && (
              <span className="text-[10px] text-slate-400 font-normal">{product.subcategory}</span>
            )}
          </div>
          <h4
            className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
            onClick={() => onViewDetails?.(product)}
            title={product.name}
          >
            {product.name}
          </h4>

          {/* AI Recommendation Intelligence Panel */}
          {recommendation && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs space-y-1.5">
              {whyThisPick && (
                <div className="text-slate-800">
                  <span className="font-bold text-emerald-900">Why this pick: </span>
                  <span className="text-slate-700">{whyThisPick}</span>
                </div>
              )}
              {budgetImpact !== undefined && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Uses {budgetImpact}% of your remaining budget</span>
                </div>
              )}

              {/* Cheaper alternative suggestion when over budget */}
              {isOverBudget && cheaperAlt && (
                <div className="mt-1 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-600 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-700" />
                    Cheaper: <strong className="text-slate-800">{cheaperAlt.name.slice(0, 18)}...</strong>
                  </span>
                  <span className="font-bold text-emerald-800">
                    {formatMoney(cheaperAlt.priceUSD || cheaperAlt.price, currency)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Specifications preview */}
          {!recommendation && (product.specs || product.specifications) && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {Object.entries((product.specs || product.specifications) as Record<string, any>).slice(0, 2).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-block text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60"
                >
                  {k.replace(/_/g, ' ')}: {String(v).slice(0, 18)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">
                {formatMoney(priceUSD, currency)}
              </span>
              {originalPriceUSD && originalPriceUSD > priceUSD && (
                <span className="text-xs text-slate-400 line-through">
                  {formatMoney(originalPriceUSD, currency)}
                </span>
              )}
            </div>
            {currency !== 'USD' && (
              <span className="text-[10px] text-slate-400 block">
                (${priceUSD.toFixed(2)} USD)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onCompare && (
              <button
                onClick={() => onCompare(product)}
                title={isComparing ? 'Remove from Compare' : 'Add to Compare'}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  isComparing
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            )}

            {onViewDetails && (
              <button
                onClick={() => onViewDetails(product)}
                title="View Full Specifications"
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            <Button
              size="sm"
              variant={justAdded ? 'secondary' : 'primary'}
              isLoading={isAdding}
              onClick={handleAddToCart}
              className={justAdded ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : ''}
              icon={justAdded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            >
              {justAdded ? 'Added' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
