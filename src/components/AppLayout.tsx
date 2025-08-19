'use client';

import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { CartSidebar } from '@/components/cart/CartSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
        <CartSidebar />
      </div>
    </CartProvider>
  );
};
