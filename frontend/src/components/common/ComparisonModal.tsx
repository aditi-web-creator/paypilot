import React from 'react';
import { ComparisonMatrix } from '../../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { ShoppingCart, Star, CheckCircle2, Trash2, Award } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatMoney } from '../../utils/currency';

export interface ComparisonModalProps {
  comparison: ComparisonMatrix | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct?: (productId: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  comparison,
  isOpen,
  onClose,
  onRemoveProduct,
}) => {
  const { addToCart } = useCart();
  const { currency } = useSettings();
  const [addingId, setAddingId] = React.useState<string | null>(null);

  if (!comparison || comparison.products.length === 0) return null;

  const handleAdd = async (productId: string) => {
    try {
      setAddingId(productId);
      await addToCart(productId, 1);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Comparison"
      subtitle={`Comparing ${comparison.products.length} products side-by-side with best-value highlights`}
      maxWidth="4xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header Row: Images, Titles & Cart actions */}
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-3 w-40 font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                Product
              </th>
              {comparison.products.map(p => (
                <th key={p.id} className="p-3 min-w-[200px] align-top bg-white">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden mb-2 border border-slate-200">
                      <img
                        src={p.imageUrl || p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">{p.brand}</span>
                    <h5 className="font-bold text-slate-900 line-clamp-2 mt-0.5">{p.name}</h5>
                    <div className="mt-2 text-base font-extrabold text-emerald-800">
                      {formatMoney(p.priceUSD || p.price, currency)}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 w-full justify-center">
                      <Button
                        size="sm"
                        isLoading={addingId === p.id}
                        onClick={() => handleAdd(p.id)}
                        icon={<ShoppingCart className="w-3.5 h-3.5" />}
                        className="text-xs py-1"
                      >
                        Add to Cart
                      </Button>
                      {onRemoveProduct && (
                        <button
                          onClick={() => onRemoveProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Matrix Attributes with Best-Value Highlights */}
          <tbody className="divide-y divide-slate-100">
            {comparison.attributes.map(attr => (
              <tr key={attr.key} className="hover:bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-700 bg-slate-50/70">
                  {attr.label}
                </td>
                {attr.values.map(val => {
                  const isBest = (val as any).isBest || (attr as any).bestProductId === val.productId;
                  return (
                    <td
                      key={val.productId}
                      className={`p-3 transition-colors ${
                        isBest
                          ? 'text-emerald-950 bg-emerald-50/70 font-semibold'
                          : 'text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isBest && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                            title="Best value for this specification"
                          >
                            <Award className="w-2.5 h-2.5 text-emerald-700" />
                            Best
                          </span>
                        )}
                        <span>
                          {attr.key === 'price'
                            ? formatMoney(Number(val.value) || 0, currency)
                            : String(val.value)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};
