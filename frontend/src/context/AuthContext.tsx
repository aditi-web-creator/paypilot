import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserBudget, UserProfile } from '../types';
import { request } from '../services/api';
import { budgetService } from '../services/orderService';

import { useSettings } from './SettingsContext';

interface AuthContextType {
  user: UserProfile | null;
  budget: UserBudget | null;
  currency: string;
  setCurrency: (curr: string) => void;
  updateBudgetLimit: (limit: number) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fullName, email, currency: settingsCurrency, monthlyLimitUSD, setCurrency: setSettingsCurrency, updateSettings } = useSettings();

  const [backendBudget, setBackendBudget] = useState<UserBudget | null>(null);

  const user: UserProfile = {
    id: '00000000-0000-0000-0000-000000000001',
    email: email,
    full_name: fullName,
    preferred_currency: settingsCurrency,
    created_at: new Date().toISOString(),
  };

  const budget: UserBudget = {
    id: backendBudget?.id || '00000000-0000-0000-0000-000000000002',
    user_id: user.id,
    budget_limit: monthlyLimitUSD,
    currency: settingsCurrency,
    updated_at: new Date().toISOString(),
  };

  const refreshAuth = async () => {
    try {
      const res = await request<{ success: boolean; user: UserProfile; budget: UserBudget }>('/auth/me');
      if (res.budget) {
        setBackendBudget(res.budget);
      }
    } catch (e) {
      console.warn('Could not refresh auth from backend, keeping active session:', e);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const updateBudgetLimit = async (limit: number) => {
    await updateSettings({ monthlyLimitUSD: limit });
    try {
      const updated = await budgetService.updateBudget(limit, settingsCurrency);
      setBackendBudget(updated);
    } catch (e) {
      console.warn('Could not sync budget limit with backend:', e);
    }
  };

  const setCurrency = (curr: string) => {
    setSettingsCurrency(curr);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        budget,
        currency: settingsCurrency,
        setCurrency,
        updateBudgetLimit,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
