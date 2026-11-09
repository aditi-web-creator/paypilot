import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname.includes('/dashboard')) return 'Application Dashboard';
    if (pathname.includes('/ai-shopping')) return 'AI Shopping Assistant';
    if (pathname.includes('/browse')) return 'Browse Products Catalog';
    if (pathname.includes('/cart')) return 'Shopping Cart';
    if (pathname.includes('/checkout')) return 'PayPal Checkout';
    if (pathname.includes('/orders')) return 'My Orders & Transaction History';
    if (pathname.includes('/budget')) return 'Budget & Spending Analytics';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/help')) return 'Judging Demonstration & Setup Guide';
    return 'PayPilot';
  };

  return (
    <div className="min-h-screen bg-surface-app text-content-primary flex">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
