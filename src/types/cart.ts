export interface CartItem {
  id: string;          // uuid [pk, not null] - shopping_cart_item.id
  user_id: string;     // uuid [not null] - foreign key to user.id
  product_id: string;  // uuid [not null] - foreign key to product.id
  quantity: number;    // int [not null]
  product?: {
    id: string;
    salon_id: string;
    name: string;
    description: string | null;
    price: number;        // stored in cents
    available_quantity: number;
    discount: number | null;
    salon_name?: string;
    image_url?: string;   // not in DB - handled separately
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
