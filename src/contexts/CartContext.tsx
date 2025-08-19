'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartState, CartContextType, CartItem, CartTotals } from '@/types/cart';
import { CartService } from '@/services/cartService';
import { calculateCartTotals } from '@/utils/cart';

// Cart reducer actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean };

// Initial state
const initialState: CartState & { isCartOpen: boolean } = {
  items: [],
  isLoading: false,
  error: null,
  isCartOpen: false,
};

// Cart reducer
const cartReducer = (
  state: CartState & { isCartOpen: boolean },
  action: CartAction
): CartState & { isCartOpen: boolean } => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CART':
      return { ...state, items: action.payload, isLoading: false, error: null };
    
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { ...state, items: [...state.items, action.payload] };
      }
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: action.payload };
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calculate totals whenever items change
  const totals: CartTotals = React.useMemo(() => {
    return calculateCartTotals(state.items);
  }, [state.items]);

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Cart actions
  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartItems = await CartService.getCart();
      dispatch({ type: 'SET_CART', payload: cartItems });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newItem = await CartService.addToCart(productId, quantity);
      dispatch({ type: 'ADD_ITEM', payload: newItem });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await CartService.updateCartItem(itemId, quantity);
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await CartService.removeFromCart(itemId);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await CartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setIsCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open });
  };

  const contextValue: CartContextType = {
    cart: {
      items: state.items,
      isLoading: state.isLoading,
      error: state.error,
    },
    totals,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    isCartOpen: state.isCartOpen,
    setIsCartOpen,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
