import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  CheckCircle2,
  Globe,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useSettings } from '../context/SettingsContext';
import {
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
  convertFromUSD,
  convertToUSD,
  getExchangeRate,
} from '../utils/currency';

export const SettingsPage: React.FC = () => {
  const {
    fullName: storedName,
    email: storedEmail,
    currency,
    monthlyLimitUSD,
    updateSettings,
    setCurrency,
    loadDemoCart,
  } = useSettings();

  const [formName, setFormName] = useState(storedName);
  const [formEmail, setFormEmail] = useState(storedEmail);
  const [formLimitInCurr, setFormLimitInCurr] = useState(
    String(Math.round(convertFromUSD(monthlyLimitUSD, currency)))
  );
  const [isLoadingDemoCart, setIsLoadingDemoCart] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync input when currency or stored values change
  useEffect(() => {
    setFormName(storedName);
    setFormEmail(storedEmail);
    setFormLimitInCurr(String(Math.round(convertFromUSD(monthlyLimitUSD, currency))));
  }, [storedName, storedEmail, currency, monthlyLimitUSD]);

  const activeSymbol = getCurrencySymbol(currency);
  const activeRate = getExchangeRate(currency);
  const numericLimitInCurr = parseFloat(formLimitInCurr) || 0;
  const calculatedUSD = convertToUSD(numericLimitInCurr, currency);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(formLimitInCurr);
    const validLimitUSD = !isNaN(parsedLimit) && parsedLimit > 0
      ? convertToUSD(parsedLimit, currency)
      : monthlyLimitUSD;

    await updateSettings({
      fullName: formName.trim() || storedName,
      email: formEmail.trim() || storedEmail,
      monthlyLimitUSD: Math.round(validLimitUSD * 100) / 100,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLoadDemoCart = async () => {
    setIsLoadingDemoCart(true);
    try {
      await loadDemoCart();
    } finally {
      setIsLoadingDemoCart(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Application Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal profile, preferred currency, financial guardrails, and demo state.
          </p>
        </div>

        <Badge variant="emerald" size="md">
          PayPal Sandbox Mode
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
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Aditi Sharma"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Instantly updates avatar initial, greetings, AI chats, and order receipts.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fintech & Currency Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Display Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                All catalog prices and budgets sync instantly across the entire application.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Default Monthly Spending Limit ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-500">{activeSymbol}</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={formLimitInCurr}
                  onChange={e => setFormLimitInCurr(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-bold text-slate-900"
                />
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Stored internally as ${calculatedUSD.toFixed(2)} USD (Rate: 1 USD = {activeRate} {currency})
              </span>
            </div>
          </div>
        </div>

        {/* Demo Fast-Action Card */}
        <div className="bg-emerald-50/70 p-6 rounded-card border border-emerald-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              Demo Quick-Start: Preload Curated Items
            </span>
            <p className="text-[11px] text-emerald-800">
              Need to test checkout quickly for judges? Populate your shopping cart with 2 top-rated products.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadDemoCart}
            disabled={isLoadingDemoCart}
            className="shrink-0 bg-white hover:bg-emerald-100 border-emerald-300 text-emerald-900 text-xs font-bold"
          >
            {isLoadingDemoCart ? 'Loading Cart...' : 'Load Demo Cart'}
          </Button>
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
          <span className="text-[11px] text-slate-500 block">
            Direct charges are converted and authorized in PayPal-compatible USD to prevent sandbox decline.
          </span>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <Button type="submit" size="md" className="ml-auto font-semibold">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
