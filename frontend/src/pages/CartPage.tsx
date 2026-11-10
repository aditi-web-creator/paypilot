import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { cartService } from '../services/cartService';
import { formatMoney } from '../utils/currency';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { currency, monthlyLimitUSD } = useSettings();

  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const cartTotalUSD = cart?.total || 0;
  const isOverBudget = cartTotalUSD > monthlyLimitUSD;
  const remainingAfterPurchaseUSD = monthlyLimitUSD - cartTotalUSD;

  const handleProceedToCheckout = async () => {
    try {
      setIsValidating(true);
      setValidationError(null);

      const val = await cartService.validateCart();
      if (!val.isValid) {
        setValidationError(val.message || 'Cart validation failed. Please review your order.');
        return;
      }

      navigate('/checkout');
    } catch (err: any) {
      setValidationError(err.message || 'Could not validate cart before checkout.');
    } finally {
      setIsValidating(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white rounded-card border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-subtle my-8">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-emerald-700" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Your shopping cart is empty</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Ask PayPilot AI to find products tailored to your preferences, or explore the catalog across 12 categories.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <NavLink to="/ai-shopping">
            <Button size="md" icon={<Bot className="w-4 h-4" />}>
              Open AI Assistant
            </Button>
          </NavLink>
          <NavLink to="/browse">
            <Button variant="outline" size="md">
              Browse Catalog
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Your Shopping Cart</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review prepared items, verified specifications, and financial guardrails.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart Items List (~65%) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-card border border-slate-200 shadow-subtle overflow-hidden divide-y divide-slate-100">
            {cart.items.map(item => {
              const itemTotalUSD = item.unit_price_snapshot * item.quantity;
              const productImg = item.product?.imageUrl || item.product?.image_url;

              return (
                <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={productImg || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {item.product?.brand || 'Brand'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.product?.name || 'Catalog Item'}
                        </h4>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          Category: {item.product?.category}
                          {item.product?.subcategory ? ` • ${item.product.subcategory}` : ''}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-slate-900 block">
                          {formatMoney(itemTotalUSD, currency)}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {formatMoney(item.unit_price_snapshot, currency)} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls and remove */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-40"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-card bg-emerald-50/50 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block">Server-Verified Price Guarantee</span>
              <p className="mt-0.5 text-slate-700 leading-relaxed">
                All item prices and taxes are calculated on the server. The AI cannot tamper with payment amounts or authorize payments without your manual confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary & Budget Enforcement (~35%) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-card border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Order Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-slate-900">{formatMoney(cart.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Estimated Shipping</span>
                  {cart.shipping === 0 && <Badge variant="success" size="sm">FREE</Badge>}
                </span>
                <span className="font-semibold text-slate-900">
                  {cart.shipping === 0 ? 'FREE' : formatMoney(cart.shipping, currency)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">{formatMoney(cart.tax, currency)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-extrabold text-slate-900">
                <span>Final Order Amount</span>
                <span className="text-base text-emerald-800">{formatMoney(cart.total, currency)}</span>
              </div>
              {currency !== 'USD' && (
                <div className="text-[11px] text-slate-400 text-right pt-1">
                  (Internal authorization: ${cart.total.toFixed(2)} USD)
                </div>
              )}
            </div>

            {/* Budget Guardrail Meter */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Monthly Spending Cap:</span>
                <span className="font-bold text-slate-900">{formatMoney(monthlyLimitUSD, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Remaining After Purchase:</span>
                <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatMoney(remainingAfterPurchaseUSD, currency)}
                </span>
              </div>

              {isOverBudget ? (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Checkout Blocked: Budget Exceeded</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This order would exceed your authorized monthly limit by{' '}
                    <strong>{formatMoney(cartTotalUSD - monthlyLimitUSD, currency)}</strong>. Reduce quantities, remove
                    items, or increase your budget in Settings.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Approved: Order fits comfortably within your monthly limit.</span>
                </div>
              )}
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Checkout CTA */}
            <Button
              size="lg"
              variant="primary"
              disabled={isOverBudget || isValidating}
              isLoading={isValidating}
              onClick={handleProceedToCheckout}
              className="w-full shadow-md font-bold"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to PayPal Checkout
            </Button>

            <span className="text-[11px] text-slate-400 text-center block">
              Official PayPal Sandbox Integration • Instant Authorization
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
