import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart } from '../types';
import { cartService } from '../services/cartService';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  isOverBudget: boolean;
  budgetLimit: number;
  currentSpent: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOverBudget, setIsOverBudget] = useState<boolean>(false);
  const [budgetLimit, setBudgetLimit] = useState<number>(500);
  const [currentSpent, setCurrentSpent] = useState<number>(0);

  const refreshCart = async () => {
    try {
      setIsLoading(true);
      const data = await cartService.getCart();
      setCart(data.cart);
      setIsOverBudget(data.budget.isOverBudget);
      setBudgetLimit(data.budget.limit);
      setCurrentSpent(data.budget.currentSpent);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await cartService.addItem(productId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartService.updateItem(itemId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      throw err;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartService.removeItem(itemId);
      await refreshCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await refreshCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
      throw err;
    }
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        isOverBudget,
        budgetLimit,
        currentSpent,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
