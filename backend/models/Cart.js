const { db } = require('../config/database');

class Cart {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.product_id = data.product_id;
    this.quantity = data.quantity;
    
    // Product details
    if (data.product_name) {
      this.product = {
        id: data.product_id,
        name: data.product_name,
        price: data.product_price,
        available_quantity: data.available_quantity,
        discount: data.product_discount,
        salon_name: data.salon_name
      };
    }
  }

  // Get all cart items for a user
  static async getByUserId(userId) {
    try {
      const result = await db.query(`
        SELECT 
          c.id,
          c.user_id,
          c.product_id,
          c.quantity,
          p.name as product_name,
          p.price as product_price,
          p.available_quantity,
          p.discount as product_discount,
          s.name as salon_name
        FROM shopping_cart_item c
        JOIN product p ON c.product_id = p.id
        JOIN salon s ON p.salon_id = s.id
        WHERE c.user_id = $1
        ORDER BY p.name ASC
      `, [userId]);

      return result.rows.map(row => new Cart(row));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw new Error('Failed to fetch cart items');
    }
  }

  // Add item to cart or update quantity if item already exists
  static async addItem(userId, productId, quantity = 1) {
    try {
      // First check if product exists and has enough inventory
      const productResult = await db.query(`
        SELECT id, available_quantity, name 
        FROM product 
        WHERE id = $1 AND is_public = true
      `, [productId]);

      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const product = productResult.rows[0];
      
      // Check if item already exists in cart
      const existingResult = await db.query(`
        SELECT id, quantity 
        FROM shopping_cart_item 
        WHERE user_id = $1 AND product_id = $2
      `, [userId, productId]);

      let cartItem;
      
      if (existingResult.rows.length > 0) {
        // Update existing cart item
        const existingItem = existingResult.rows[0];
        const newQuantity = existingItem.quantity + quantity;
        
        // Check inventory
        if (newQuantity > product.available_quantity) {
          throw new Error(`Insufficient inventory. Available: ${product.available_quantity}, Requested: ${newQuantity}`);
        }
        
        const updateResult = await db.query(`
          UPDATE shopping_cart_item 
          SET quantity = $3
          WHERE user_id = $1 AND product_id = $2
          RETURNING *
        `, [userId, productId, newQuantity]);
        
        cartItem = updateResult.rows[0];
      } else {
        // Check inventory for new item
        if (quantity > product.available_quantity) {
          throw new Error(`Insufficient inventory. Available: ${product.available_quantity}, Requested: ${quantity}`);
        }
        
        // Create new cart item
        const insertResult = await db.query(`
          INSERT INTO shopping_cart_item (user_id, product_id, quantity)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [userId, productId, quantity]);
        
        cartItem = insertResult.rows[0];
      }

      // Return the cart item with product details
      const detailResult = await db.query(`
        SELECT 
          c.id,
          c.user_id,
          c.product_id,
          c.quantity,
          p.name as product_name,
          p.price as product_price,
          p.available_quantity,
          p.discount as product_discount,
          s.name as salon_name
        FROM shopping_cart_item c
        JOIN product p ON c.product_id = p.id
        JOIN salon s ON p.salon_id = s.id
        WHERE c.id = $1
      `, [cartItem.id]);

      return new Cart(detailResult.rows[0]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  static async updateQuantity(userId, productId, quantity) {
    try {
      // Check if product has enough inventory
      const productResult = await db.query(`
        SELECT available_quantity 
        FROM product 
        WHERE id = $1 AND is_public = true
      `, [productId]);

      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const product = productResult.rows[0];
      
      if (quantity > product.available_quantity) {
        throw new Error(`Insufficient inventory. Available: ${product.available_quantity}, Requested: ${quantity}`);
      }

      const result = await db.query(`
        UPDATE shopping_cart_item 
        SET quantity = $3
        WHERE user_id = $1 AND product_id = $2
        RETURNING *
      `, [userId, productId, quantity]);

      if (result.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      // Return the updated cart item with product details
      const detailResult = await db.query(`
        SELECT 
          c.id,
          c.user_id,
          c.product_id,
          c.quantity,
          p.name as product_name,
          p.price as product_price,
          p.available_quantity,
          p.discount as product_discount,
          s.name as salon_name
        FROM shopping_cart_item c
        JOIN product p ON c.product_id = p.id
        JOIN salon s ON p.salon_id = s.id
        WHERE c.id = $1
      `, [result.rows[0].id]);

      return new Cart(detailResult.rows[0]);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  }

  // Remove item from cart
  static async removeItem(userId, productId) {
    try {
      const result = await db.query(`
        DELETE FROM shopping_cart_item 
        WHERE user_id = $1 AND product_id = $2
        RETURNING *
      `, [userId, productId]);

      if (result.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  // Clear entire cart
  static async clearCart(userId) {
    try {
      const result = await db.query(`
        DELETE FROM shopping_cart_item 
        WHERE user_id = $1
        RETURNING *
      `, [userId]);

      return {
        deletedCount: result.rows.length,
        message: `Cleared ${result.rows.length} items from cart`
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart total
  static async getCartTotal(userId) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as item_count,
          SUM(c.quantity) as total_quantity,
          SUM(c.quantity * CASE 
            WHEN p.discount IS NOT NULL AND p.discount > 0 
            THEN p.price * (1 - p.discount / 100.0)
            ELSE p.price
          END) as total_amount
        FROM shopping_cart_item c
        JOIN product p ON c.product_id = p.id
        WHERE c.user_id = $1
      `, [userId]);

      const row = result.rows[0];
      return {
        itemCount: parseInt(row.item_count) || 0,
        totalQuantity: parseInt(row.total_quantity) || 0,
        totalAmount: parseFloat(row.total_amount) || 0
      };
    } catch (error) {
      console.error('Error calculating cart total:', error);
      throw error;
    }
  }
}

module.exports = Cart;
