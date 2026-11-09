import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserBudget, UserProfile } from '../types';
import { request } from '../services/api';
import { budgetService } from '../services/orderService';

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
  const [user, setUser] = useState<UserProfile | null>({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'demo.shopper@paypilot.ai',
    full_name: 'Alex Mercer',
    preferred_currency: 'USD',
    created_at: new Date().toISOString(),
  });
  const [budget, setBudget] = useState<UserBudget | null>({
    id: '00000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000001',
    budget_limit: 500,
    currency: 'USD',
    updated_at: new Date().toISOString(),
  });
  const [currency, setCurrencyState] = useState<string>('USD');

  const refreshAuth = async () => {
    try {
      const res = await request<{ success: boolean; user: UserProfile; budget: UserBudget }>('/auth/me');
      if (res.user) setUser(res.user);
      if (res.budget) {
        setBudget(res.budget);
        setCurrencyState(res.budget.currency || 'USD');
      }
    } catch (e) {
      console.warn('Could not refresh auth from backend, keeping demo user session:', e);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const updateBudgetLimit = async (limit: number) => {
    const updated = await budgetService.updateBudget(limit, currency);
    setBudget(updated);
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    if (budget) {
      budgetService.updateBudget(budget.budget_limit, curr);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        budget,
        currency,
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
