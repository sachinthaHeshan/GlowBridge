"use client";

import React from "react";
import { ShoppingCartProvider } from "@/components/shopping/ShoppingProvider";
import CartSidebar from "@/components/shopping/CartSidebar";

interface ShoppingLayoutProps {
  children: React.ReactNode;
}

export default function ShoppingLayout({ children }: ShoppingLayoutProps) {
  return (
    <ShoppingCartProvider>
      <div className="min-h-screen bg-background">
        {children}
        <CartSidebar />
      </div>
    </ShoppingCartProvider>
  );
}
