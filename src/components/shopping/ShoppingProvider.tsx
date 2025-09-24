"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: number;
  originalId: string; // Store the original UUID for backend operations
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  clearInvalidItems: () => void; // NEW: Clear items without originalId
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(
  undefined
);

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error(
      "useShoppingCart must be used within a ShoppingCartProvider"
    );
  }
  return context;
}

interface ShoppingCartProviderProps {
  children: React.ReactNode;
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("glowbridge-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Migration: Filter out cart items that don't have originalId (from old version)
        const validCartItems = parsedCart.filter(
          (item: CartItem) =>
            item.originalId && typeof item.originalId === "string"
        );

        // If we filtered out items, log a message
        if (validCartItems.length !== parsedCart.length) {
          console.log("Migrated cart: removed items without originalId");
        }

        setCartItems(validCartItems);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        // Clear invalid cart data
        localStorage.removeItem("glowbridge-cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("glowbridge-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + (item.quantity || 1),
              }
            : cartItem
        );
      }

      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });

    // Show cart panel when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearInvalidItems = () => {
    setCartItems((prev) =>
      prev.filter(
        (item) => item.originalId && typeof item.originalId === "string"
      )
    );
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const value: ShoppingCartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearInvalidItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  };

  return (
    <ShoppingCartContext.Provider value={value}>
      {children}
    </ShoppingCartContext.Provider>
  );
}
