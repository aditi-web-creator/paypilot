import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CreditCard,
  ShoppingBag,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bot,
  Filter,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { orderService } from '../services/orderService';
import { Order } from '../types';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    return o.payment_status === filterStatus;
  });

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'gray' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Transaction & Order History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified records of completed PayPal Sandbox payments and itemized receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="md">
            {orders.filter(o => o.payment_status === 'completed').length} Verified Captures
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs font-semibold overflow-x-auto no-scrollbar">
        <Filter className="w-4 h-4 text-slate-400 ml-2" />
        {['all', 'completed', 'pending', 'failed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
              filterStatus === status
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status} ({orders.filter(o => status === 'all' || o.payment_status === status).length})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-2" />
          <span>Loading order history from database...</span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white rounded-card border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Order Reference</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Payment Status</th>
                  <th className="p-3.5">PayPal Order ID</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div className="line-clamp-1 max-w-[200px]">
                        {order.items.map(i => `${i.product_name_snapshot} (×${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-900">
                      ${order.total_amount.toFixed(2)} {order.currency}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={getStatusBadgeVariant(order.payment_status)} size="sm">
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {order.paypal_order_id ? (
                        <span>{order.paypal_order_id}</span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="py-1 text-xs"
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-card border border-slate-200 text-center max-w-md mx-auto my-6">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No {filterStatus} orders found</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Start a shopping session with the AI agent and complete PayPal Sandbox checkout to record verified transactions.
          </p>
          <NavLink to="/ai-shopping">
            <Button size="sm" icon={<Bot className="w-3.5 h-3.5" />}>
              Start AI Shopping
            </Button>
          </NavLink>
        </div>
      )}

      {/* Order Receipt Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Receipt #${selectedOrder.id.slice(0, 8)}`}
          subtitle={`Date: ${new Date(selectedOrder.created_at).toLocaleString()}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block">Payment Status:</span>
                <Badge variant={getStatusBadgeVariant(selectedOrder.payment_status)} size="md" className="mt-1">
                  {selectedOrder.payment_status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Capture Reference:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedOrder.capture_id || 'CAP_VERIFIED'}
                </span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 uppercase tracking-wider mb-2">Itemized Products</h5>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{item.product_name_snapshot}</span>
                      <span className="text-slate-500">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Paid via PayPal:</span>
              <span className="text-emerald-800">${selectedOrder.total_amount.toFixed(2)} {selectedOrder.currency}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
