import { db, PoolClient } from '@/lib/database';
import { ShoppingCartItem, CartItemWithProduct } from '@/types/database';

export class CartService {
  // Get user's cart items
  static async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    try {
      const result = await db.query(`
        SELECT 
          sci.id,
          sci.user_id,
          sci.product_id,
          sci.quantity,
          p.name,
          p.description,
          p.price,
          p.available_quantity,
          p.discount,
          s.name as salon_name,
          s.location as salon_location
        FROM shopping_cart_item sci
        JOIN product p ON sci.product_id = p.id
        JOIN salon s ON p.salon_id = s.id
        WHERE sci.user_id = $1 AND p.is_public = true
        ORDER BY sci.id DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        quantity: row.quantity,
        product: {
          id: row.product_id,
          salon_id: '', // We have the salon info separately
          name: row.name,
          description: row.description,
          price: row.price, // Already in cents from database
          available_quantity: row.available_quantity,
          is_public: true,
          discount: row.discount,
          salon_name: row.salon_name,
          salon_location: row.salon_location
        }
      }));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw new Error('Failed to fetch cart items');
    }
  }

  // Add item to cart
  static async addToCart(userId: string, productId: string, quantity: number): Promise<CartItemWithProduct> {
    return await db.transaction(async (client: PoolClient) => {
      try {
        // Check if product exists and has sufficient quantity
        const productResult = await client.query(`
          SELECT 
            p.id,
            p.salon_id,
            p.name,
            p.description,
            p.price,
            p.available_quantity,
            p.discount,
            s.name as salon_name,
            s.location as salon_location
          FROM product p
          JOIN salon s ON p.salon_id = s.id
          WHERE p.id = $1 AND p.is_public = true
        `, [productId]);

        if (productResult.rows.length === 0) {
          throw new Error('Product not found');
        }

        const product = productResult.rows[0];

        if (product.available_quantity < quantity) {
          throw new Error('Insufficient inventory');
        }

        // Check if item already exists in cart
        const existingResult = await client.query(`
          SELECT id, quantity 
          FROM shopping_cart_item 
          WHERE user_id = $1 AND product_id = $2
        `, [userId, productId]);

        let cartItem: any;

        if (existingResult.rows.length > 0) {
          // Update existing cart item
          const existingItem = existingResult.rows[0];
          const newQuantity = existingItem.quantity + quantity;

          if (product.available_quantity < newQuantity) {
            throw new Error('Insufficient inventory for requested quantity');
          }

          const updateResult = await client.query(`
            UPDATE shopping_cart_item 
            SET quantity = $3
            WHERE user_id = $1 AND product_id = $2
            RETURNING id, quantity
          `, [userId, productId, newQuantity]);

          cartItem = updateResult.rows[0];
          cartItem.quantity = newQuantity;
        } else {
          // Create new cart item
          const insertResult = await client.query(`
            INSERT INTO shopping_cart_item (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING id, quantity
          `, [userId, productId, quantity]);

          cartItem = insertResult.rows[0];
        }

        return {
          id: cartItem.id,
          user_id: userId,
          product_id: productId,
          quantity: cartItem.quantity,
          product: {
            id: productId,
            salon_id: product.salon_id,
            name: product.name,
            description: product.description,
            price: product.price,
            available_quantity: product.available_quantity,
            is_public: true,
            discount: product.discount,
            salon_name: product.salon_name,
            salon_location: product.salon_location
          }
        };
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    });
  }

  // Update cart item quantity
  static async updateCartItemQuantity(
    userId: string, 
    cartItemId: string, 
    quantity: number
  ): Promise<CartItemWithProduct | null> {
    return await db.transaction(async (client: PoolClient) => {
      try {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          await client.query(`
            DELETE FROM shopping_cart_item 
            WHERE id = $1 AND user_id = $2
          `, [cartItemId, userId]);
          return null;
        }

        // Get cart item with product info
        const cartResult = await client.query(`
          SELECT 
            sci.id,
            sci.user_id,
            sci.product_id,
            sci.quantity,
            p.name,
            p.description,
            p.price,
            p.available_quantity,
            p.discount,
            s.name as salon_name,
            s.location as salon_location
          FROM shopping_cart_item sci
          JOIN product p ON sci.product_id = p.id
          JOIN salon s ON p.salon_id = s.id
          WHERE sci.id = $1 AND sci.user_id = $2
        `, [cartItemId, userId]);

        if (cartResult.rows.length === 0) {
          throw new Error('Cart item not found');
        }

        const cartItem = cartResult.rows[0];

        // Check inventory
        if (cartItem.available_quantity < quantity) {
          throw new Error('Insufficient inventory');
        }

        // Update quantity
        await client.query(`
          UPDATE shopping_cart_item 
          SET quantity = $3
          WHERE id = $1 AND user_id = $2
        `, [cartItemId, userId, quantity]);

        return {
          id: cartItem.id,
          user_id: cartItem.user_id,
          product_id: cartItem.product_id,
          quantity: quantity,
          product: {
            id: cartItem.product_id,
            salon_id: '',
            name: cartItem.name,
            description: cartItem.description,
            price: cartItem.price,
            available_quantity: cartItem.available_quantity,
            is_public: true,
            discount: cartItem.discount,
            salon_name: cartItem.salon_name,
            salon_location: cartItem.salon_location
          }
        };
      } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
      }
    });
  }

  // Remove item from cart
  static async removeFromCart(userId: string, cartItemId: string): Promise<boolean> {
    try {
      const result = await db.query(`
        DELETE FROM shopping_cart_item 
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `, [cartItemId, userId]);

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  }

  // Clear entire cart
  static async clearCart(userId: string): Promise<boolean> {
    try {
      await db.query(`
        DELETE FROM shopping_cart_item WHERE user_id = $1
      `, [userId]);

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  // Get cart item count
  static async getCartItemCount(userId: string): Promise<number> {
    try {
      const result = await db.query(`
        SELECT COALESCE(SUM(quantity), 0) as total_count
        FROM shopping_cart_item 
        WHERE user_id = $1
      `, [userId]);

      return parseInt(result.rows[0].total_count);
    } catch (error) {
      console.error('Error getting cart count:', error);
      throw new Error('Failed to get cart count');
    }
  }

  // Get cart total (in cents)
  static async getCartTotal(userId: string): Promise<number> {
    try {
      const result = await db.query(`
        SELECT COALESCE(SUM(sci.quantity * p.price), 0) as total_amount
        FROM shopping_cart_item sci
        JOIN product p ON sci.product_id = p.id
        WHERE sci.user_id = $1 AND p.is_public = true
      `, [userId]);

      return parseInt(result.rows[0].total_amount); // Already in cents
    } catch (error) {
      console.error('Error calculating cart total:', error);
      throw new Error('Failed to calculate cart total');
    }
  }

  // Validate cart items (check inventory before checkout)
  static async validateCartItems(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const result = await db.query(`
        SELECT 
          sci.quantity,
          p.name,
          p.available_quantity
        FROM shopping_cart_item sci
        JOIN product p ON sci.product_id = p.id
        WHERE sci.user_id = $1 AND p.is_public = true
      `, [userId]);

      const errors: string[] = [];

      for (const item of result.rows) {
        if (item.available_quantity < item.quantity) {
          errors.push(`${item.name}: Only ${item.available_quantity} available, but ${item.quantity} requested`);
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      throw new Error('Failed to validate cart');
    }
  }
}

export default CartService;
