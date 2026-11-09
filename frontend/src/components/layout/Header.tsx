import React from 'react';
import { Menu, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title }) => {
  const { itemCount, cart } = useCart();
  const { currency, setCurrency, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-lg font-bold text-slate-900 hidden sm:block">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* PayPal Sandbox Environment Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PayPal Sandbox (Zero-Risk Test Mode)</span>
        </div>

        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="USD">USD ($)</option>
          <option value="INR">INR (₹)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>

        {/* Cart Quick Button */}
        <NavLink
          to="/cart"
          className="relative p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2"
          title="View Shopping Cart"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-700" />
          {cart && cart.items.length > 0 && (
            <span className="text-xs font-bold hidden sm:inline text-slate-900">
              ${cart.total.toFixed(2)}
            </span>
          )}
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white shadow">
              {itemCount}
            </span>
          )}
        </NavLink>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs">
            {user?.full_name?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {user?.full_name || 'Alex Mercer'}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight">Demo Shopper</span>
          </div>
        </div>
      </div>
    </header>
  );
};
