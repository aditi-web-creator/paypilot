import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Calendar,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { budgetService } from '../services/orderService';
import { SpendingSummary } from '../types';
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
  BarChart,
  Bar,
} from 'recharts';

export const BudgetPage: React.FC = () => {
  const { budget, updateBudgetLimit, currency } = useAuth();
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [newLimit, setNewLimit] = useState<string>('500');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await budgetService.getBudgetAndSummary();
        setSummary(res.summary);
        if (res.budget) {
          setNewLimit(String(res.budget.budget_limit));
        }
      } catch (err) {
        console.error('Failed to load budget summary:', err);
      }
    }
    loadSummary();
  }, [budget]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newLimit);
    if (isNaN(val) || val <= 0) return;

    try {
      setIsUpdating(true);
      await updateBudgetLimit(val);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2500);
    } finally {
      setIsUpdating(false);
    }
  };

  const COLORS = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#0284c7', '#6366f1'];

  const categoryData = summary?.by_category?.length
    ? summary.by_category
    : [{ category: 'No Purchases Yet', amount: 1, count: 0 }];

  const trendData = summary?.spending_trend?.length
    ? summary.spending_trend
    : [
        { date: 'Initial', amount: 0 },
        { date: 'Current', amount: summary?.total_spent || 0 },
      ];

  const totalSpent = summary?.total_spent || 0;
  const currentLimit = budget?.budget_limit || 500;
  const remaining = Math.max(0, currentLimit - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / (currentLimit || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Budget Guardrails & Spending</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your monthly purchasing ceiling. Enforced strictly by the Express backend API.
          </p>
        </div>

        <Badge variant="emerald" size="md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Active Guardrails
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-card border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approved Limit
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            ${currentLimit.toFixed(2)} {currency}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Enforced ceiling across all cart sessions
          </span>
        </div>

        <div className="bg-white p-5 rounded-card border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Spent
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            ${totalSpent.toFixed(2)} {currency}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {percentUsed}% of authorized cap utilized
          </span>
        </div>

        <div className="bg-white p-5 rounded-card border border-slate-200 shadow-subtle">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Remaining Runway
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            ${remaining.toFixed(2)} {currency}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Safe spending balance remaining
          </span>
        </div>
      </div>

      {/* Budget Adjustment Form */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-700" />
          Update Monthly Spending Ceiling
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-2xl leading-relaxed">
          PayPilot requires all checkout attempts to be validated against this limit. If a shopping
          cart exceeds your authorized allowance, checkout will be automatically blocked.
        </p>

        <form onSubmit={handleUpdate} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
            <input
              type="number"
              min="10"
              step="10"
              value={newLimit}
              onChange={e => setNewLimit(e.target.value)}
              className="pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
            />
          </div>

          <Button type="submit" size="md" isLoading={isUpdating}>
            Save New Limit
          </Button>

          {updateSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              Budget successfully updated in database!
            </span>
          )}
        </form>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Donut) */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Purchases by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Historical distribution across catalog categories</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Trend (Bar / Area Chart) */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Expenditure Timeline</h3>
          <p className="text-xs text-slate-500 mb-4">Aggregated daily transaction totals</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Spent']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="amount" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
