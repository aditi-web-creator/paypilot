import React, { useState } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Bell,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, budget, currency, setCurrency, updateBudgetLimit } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Alex Mercer');
  const [email, setEmail] = useState(user?.email || 'demo.shopper@paypilot.ai');
  const [budgetVal, setBudgetVal] = useState(String(budget?.budget_limit || '500'));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(budgetVal) > 0) {
      await updateBudgetLimit(parseFloat(budgetVal));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Application Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal profile, preferred currency, financial guardrails, and demo status.
          </p>
        </div>

        <Badge variant="emerald" size="md">
          Sandbox Mode
        </Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              User Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fintech Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-semibold"
              >
                <option value="USD">USD ($) — Universally Supported Sandbox Currency</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                PayPal Sandbox transactions operate with consistent currency conversion.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Monthly Spending Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  value={budgetVal}
                  onChange={e => setBudgetVal(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-bold"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Enforced server-side before creating any PayPal Sandbox order.
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Notifications & Warnings
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs py-2">
            <div>
              <span className="font-semibold text-slate-900 block">Budget Exceeded Alerts</span>
              <span className="text-slate-500">
                Warn me in the split-screen view when selected items exceed my monthly ceiling.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={e => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* PayPal Developer Diagnostics (Read-Only) */}
        <div className="bg-slate-50 p-6 rounded-card border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              PayPal Developer Platform Diagnostics
            </span>
            <Badge variant="emerald" size="sm">
              Sandbox Live
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
            <div className="p-2.5 rounded bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold">API ENDPOINT</span>
              <span className="font-mono text-slate-800">https://api-m.sandbox.paypal.com</span>
            </div>
            <div className="p-2.5 rounded bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold">SDK PROTOCOL</span>
              <span className="font-mono text-slate-800">Orders API v2 (Intent: CAPTURE)</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Client Secret is stored only on the backend server environment. Never exposed to the browser.
          </span>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <Button type="submit" size="md" className="ml-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
