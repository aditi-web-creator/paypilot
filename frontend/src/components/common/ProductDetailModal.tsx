import React, { useState } from 'react';
import { Product } from '../../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Star, ShoppingCart, MessageSquare, CheckCircle2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { aiService } from '../../services/aiService';

export interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAskInAiChat?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAskInAiChat,
}) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  if (!product) return null;

  const handleAdd = async () => {
    try {
      setIsAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAskQuickQuestion = async () => {
    if (!question.trim()) return;
    try {
      setIsAsking(true);
      const res = await aiService.askProductDetails(product.id, question);
      setAiAnswer(res.explanation);
    } catch (e) {
      setAiAnswer('Unable to query AI regarding this product right now.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Image & Key Highlights */}
        <div>
          <div className="rounded-xl overflow-hidden bg-slate-100 aspect-square border border-slate-200 shadow-sm relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="emerald" size="md" className="backdrop-blur bg-white/90">
                {product.category}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow border border-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Fintech Trust Signals */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Catalog</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Free Shipping &gt;$50</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Budget Protected</span>
            </div>
          </div>
        </div>

        {/* Right column: Details, Specs & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {product.brand}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{product.name}</h2>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">USD • Tax calculated at checkout</span>
              <Badge
                variant={product.stock_status === 'in_stock' ? 'success' : 'warning'}
                size="sm"
              >
                {product.stock_status === 'in_stock' ? 'In Stock' : 'Low Stock'}
              </Badge>
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{product.description}</p>

            {/* Specifications Table */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Verified Technical Specifications
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <div key={key} className="flex px-3 py-2 bg-white even:bg-slate-50/50">
                    <span className="w-1/3 font-medium text-slate-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="w-2/3 text-slate-800 font-semibold">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick AI Question */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Ask PayPilot AI about this product
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Does this have a warranty? Is it good for travel?"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskQuickQuestion()}
                  className="flex-1 text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                />
                <Button size="sm" isLoading={isAsking} onClick={handleAskQuickQuestion}>
                  Ask
                </Button>
              </div>

              {aiAnswer && (
                <div className="mt-2.5 p-2.5 rounded bg-white border border-emerald-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {onAskInAiChat && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  onClose();
                  onAskInAiChat(product);
                }}
                icon={<MessageSquare className="w-4 h-4 text-emerald-700" />}
              >
                Discuss with AI Copilot
              </Button>
            )}

            <Button
              variant={added ? 'secondary' : 'primary'}
              size="md"
              isLoading={isAdding}
              onClick={handleAdd}
              icon={added ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShoppingCart className="w-4 h-4" />}
              className="flex-1"
            >
              {added ? 'Added to Cart' : `Add to Cart — $${product.price.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
