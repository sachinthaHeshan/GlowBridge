export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    salon_id: string;
    name: string;
    description: string;
    price: number;
    available_quantity: number;
    discount: number;
    salon_name?: string;
    image_url?: string;
  };
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

export interface CartTotals {
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  itemCount: number;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartContextType {
  // State
  cart: CartState;
  totals: CartTotals;
  
  // Actions
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  
  // UI State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}
