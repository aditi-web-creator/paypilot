import React from 'react';
import { Product, ProductRecommendation } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { ShoppingCart, Star, Eye, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export interface ProductCardProps {
  product: Product;
  recommendation?: ProductRecommendation;
  onViewDetails?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  onAskAi?: (product: Product) => void;
  isComparing?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  recommendation,
  onViewDetails,
  onCompare,
  onAskAi,
  isComparing,
}) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

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

  const budgetFitVariants: { [key: string]: 'emerald' | 'blue' | 'warning' | 'error' } = {
    well_within: 'emerald',
    at_budget: 'blue',
    slightly_over: 'warning',
    significantly_over: 'error',
  };

  const budgetFitLabels: { [key: string]: string } = {
    well_within: 'Well Within Budget',
    at_budget: 'At Budget Limit',
    slightly_over: 'Slightly Over Budget',
    significantly_over: 'Over Budget',
  };

  return (
    <div className="group bg-white rounded-card border border-slate-200/80 shadow-subtle hover:shadow-elevated hover:border-emerald-200 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // fallback image
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
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
        </div>

        {/* Rating and Stock */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
          <span className="inline-flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-800 shadow-sm border border-slate-200/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
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
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            {product.brand}
          </div>
          <h4
            className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
            onClick={() => onViewDetails?.(product)}
            title={product.name}
          >
            {product.name}
          </h4>

          {/* AI Match Rationale (if in recommendation mode) */}
          {recommendation && (
            <div className="mt-2.5 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100/80 text-xs text-emerald-950">
              <div className="flex items-center gap-1 font-semibold text-emerald-800 mb-0.5">
                <Badge variant={budgetFitVariants[recommendation.budget_fit]} size="sm">
                  {budgetFitLabels[recommendation.budget_fit]}
                </Badge>
              </div>
              <p className="line-clamp-2 text-slate-700 mt-1">
                {recommendation.match_reasons[0] || 'Matches your required specifications.'}
              </p>
            </div>
          )}

          {/* Quick Specifications preview */}
          {!recommendation && product.specifications && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {Object.entries(product.specifications).slice(0, 2).map(([k, v]) => (
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
            <span className="text-xs text-slate-500 block leading-tight">Price</span>
            <span className="text-lg font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
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
