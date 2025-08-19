'use client';

import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { AnimatedCartSidebar } from '@/components/cart/AnimatedCartSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
        <AnimatedCartSidebar />
      </div>
    </CartProvider>
  );
};
