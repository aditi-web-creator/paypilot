import React, { createContext, useContext, useEffect, useState } from 'react';
import { budgetService } from '../services/orderService';
import { cartService } from '../services/cartService';
import { productService } from '../services/productService';

export interface SettingsState {
  fullName: string;
  email: string;
  currency: string;
  monthlyLimitUSD: number;
}

interface SettingsContextType extends SettingsState {
  avatarInitial: string;
  toastMessage: string | null;
  updateSettings: (newSettings: Partial<SettingsState>) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  loadDemoCart: () => Promise<void>;
  dismissToast: () => void;
}

const STORAGE_KEY = 'paypilot_user_settings_v2';

const DEFAULT_SETTINGS: SettingsState = {
  fullName: 'Aditi Sharma',
  email: 'aditi.sharma@paypilot.ai',
  currency: 'INR',
  monthlyLimitUSD: 500,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          fullName: parsed.fullName || DEFAULT_SETTINGS.fullName,
          email: parsed.email || DEFAULT_SETTINGS.email,
          currency: parsed.currency || DEFAULT_SETTINGS.currency,
          monthlyLimitUSD: typeof parsed.monthlyLimitUSD === 'number' ? parsed.monthlyLimitUSD : DEFAULT_SETTINGS.monthlyLimitUSD,
        };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  const updateSettings = async (newSettings: Partial<SettingsState>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });

    // Sync budget with backend if monthlyLimitUSD or currency changed
    try {
      const targetLimit = newSettings.monthlyLimitUSD !== undefined ? newSettings.monthlyLimitUSD : settings.monthlyLimitUSD;
      const targetCurrency = newSettings.currency || settings.currency;
      await budgetService.updateBudget(targetLimit, targetCurrency);
    } catch (e) {
      console.warn('Could not sync budget with backend:', e);
    }

    showToast('Settings saved successfully!');
  };

  const setCurrency = async (curr: string) => {
    const upperCurr = curr.toUpperCase();
    await updateSettings({ currency: upperCurr });
  };

  const loadDemoCart = async () => {
    try {
      // Clear existing cart and load 2 curated items
      await cartService.clearCart();
      const productsRes = await productService.getProducts({ limit: 4, sort: 'rating_desc' });
      if (productsRes.products.length >= 2) {
        await cartService.addItem(productsRes.products[0].id, 1);
        await cartService.addItem(productsRes.products[1].id, 1);
        showToast('Demo cart loaded with 2 popular items!');
      } else {
        showToast('Cart initialized!');
      }
    } catch (e) {
      console.error('Failed to load demo cart:', e);
      showToast('Could not load demo cart. Please try again.');
    }
  };

  const dismissToast = () => setToastMessage(null);

  const avatarInitial = settings.fullName?.trim()?.[0]?.toUpperCase() || 'P';

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        avatarInitial,
        toastMessage,
        updateSettings,
        setCurrency,
        loadDemoCart,
        dismissToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-lg border border-emerald-700 animate-slide-up">
          <svg className="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={dismissToast} className="ml-2 text-emerald-200 hover:text-white text-xs underline">
            Dismiss
          </button>
        </div>
      )}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
