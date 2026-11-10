import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  CreditCard,
  PieChart as PieChartIcon,
  Bot,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { budgetService } from '../services/orderService';
import { Order } from '../types';
import { useSettings } from '../context/SettingsContext';
import { formatMoney } from '../utils/currency';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { fullName, currency, monthlyLimitUSD } = useSettings();
  const [data, setData] = useState<{
    profile: any;
    budgetLimit: number;
    totalSpent: number;
    remainingBudget: number;
    totalPurchases: number;
    currency: string;
    recentTransactions: Order[];
    spendingTrend: { date: string; amount: number }[];
    categoryBreakdown: { category: string; amount: number; count: number }[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await budgetService.getDashboardSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const COLORS = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#0284c7', '#6366f1'];

  // Default trend if no transactions yet
  const chartData = data?.spendingTrend?.length
    ? data.spendingTrend
    : [
        { date: 'Day 1', amount: 0 },
        { date: 'Day 2', amount: 0 },
        { date: 'Today', amount: data?.totalSpent || 0 },
      ];

  const categoryData = data?.categoryBreakdown?.length
    ? data.categoryBreakdown
    : [{ category: 'No Purchases Yet', amount: 1, count: 0 }];

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-card-lg p-6 text-white shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>PayPilot Fintech Dashboard</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {fullName}
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-xl">
            Your autonomous AI shopping copilot is active. Search verified products, enforce your budget
            limits, and authorize payments with PayPal Sandbox.
          </p>
        </div>

        <div className="flex gap-2">
          <NavLink to="/ai-shopping">
            <Button size="md" className="bg-white text-emerald-900 hover:bg-emerald-50 shadow font-bold" icon={<Bot className="w-4 h-4 text-emerald-700" />}>
              Start AI Shopping
            </Button>
          </NavLink>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Budget Card */}
        <div className="bg-white p-5 rounded-card border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Budget</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatMoney(data?.budgetLimit ?? monthlyLimitUSD, currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Approved spending limit</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Protection:</span>
            <span className="font-semibold text-emerald-700">Strict Enforcement</span>
          </div>
        </div>

        {/* Total Spending Card */}
        <div className="bg-white p-5 rounded-card border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spending</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatMoney(data?.totalSpent ?? 0, currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Verified settled captures</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Budget used:</span>
            <span className="font-semibold text-slate-700">
              {data ? Math.round((data.totalSpent / (data.budgetLimit || monthlyLimitUSD || 1)) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className="bg-white p-5 rounded-card border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Remaining Runway</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {formatMoney(data?.remainingBudget ?? Math.max(0, monthlyLimitUSD - (data?.totalSpent ?? 0)), currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Safe spending allowance</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status:</span>
            <span className="font-semibold text-emerald-700">Healthy</span>
          </div>
        </div>

        {/* Total Purchases Card */}
        <div className="bg-white p-5 rounded-card border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Orders</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.totalPurchases || 0}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">PayPal verified transactions</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <NavLink to="/orders" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* 3. Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-card border border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Spending Over Time</h3>
              <p className="text-xs text-slate-500">Persisted order amounts tracked by date</p>
            </div>
            <Badge variant="emerald" size="sm">
              Real Data
            </Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => formatMoney(v, currency)} />
                <Tooltip
                  formatter={(value: any) => [formatMoney(Number(value), currency), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#047857"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Donut Chart) */}
        <div className="bg-white p-5 rounded-card border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
                <p className="text-xs text-slate-500">Purchases by product category</p>
              </div>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val), currency), 'Spent']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto divide-y divide-slate-100 text-xs">
            {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              data.categoryBreakdown.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700">{cat.category}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatMoney(cat.amount, currency)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-xs py-2">
                No orders yet. Start shopping with the AI assistant!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions & Quick AI Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-card border border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Completed Purchases</h3>
              <p className="text-xs text-slate-500">Verified PayPal Sandbox captures</p>
            </div>
            <NavLink to="/orders" className="text-xs font-semibold text-emerald-700 hover:underline">
              View All ({data?.totalPurchases || 0})
            </NavLink>
          </div>

          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Items</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentTransactions.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-medium text-slate-800">
                        {o.paypal_order_id ? o.paypal_order_id.slice(0, 16) : o.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 text-slate-700">
                        {o.items?.length || 1} item(s)
                      </td>
                      <td className="py-3 text-slate-500">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {formatMoney(o.total_amount, currency)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={o.payment_status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {o.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No transactions yet. Complete a checkout in the AI Shopping assistant to see it here.</p>
            </div>
          )}
        </div>

        {/* Quick AI Shopping Suggestions */}
        <div className="bg-slate-50 p-5 rounded-card border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Suggested AI Prompts</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Click any prompt below to automatically launch the AI assistant with that search.
            </p>

            <div className="space-y-2">
              {[
                `Find wireless headphones under ${formatMoney(100, currency)} for studying with noise cancellation`,
                `Find a programming laptop under ${formatMoney(1200, currency)} with 16GB RAM`,
                `Compare mechanical keyboards under ${formatMoney(90, currency)}`,
                `Find a smartwatch with heart rate & GPS under ${formatMoney(150, currency)}`,
              ].map(prompt => (
                <NavLink
                  key={prompt}
                  to={`/ai-shopping?prompt=${encodeURIComponent(prompt)}`}
                  className="block p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 hover:border-emerald-500 hover:text-emerald-800 transition-colors shadow-sm"
                >
                  "{prompt}"
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 text-center">
            <NavLink to="/ai-shopping">
              <Button size="sm" className="w-full" icon={<Bot className="w-4 h-4" />}>
                Open Full Assistant
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
