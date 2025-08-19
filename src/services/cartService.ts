import { CartItem } from '@/types/cart';

export class CartService {
  private static baseUrl = '/api';

  // Fetch user's cart items with product details
  static async getCart(): Promise<CartItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  // Add item to cart
  static async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    try {
      const response = await fetch(`${this.baseUrl}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to add item to cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      
      // Re-throw the error as-is if it's already a custom error
      throw error;
    }
  }

  // Update item quantity
  static async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    try {
      const response = await fetch(`${this.baseUrl}/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update cart item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  static async removeFromCart(itemId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Clear entire cart
  static async clearCart(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}
