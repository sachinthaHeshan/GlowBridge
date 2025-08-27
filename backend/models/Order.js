const { db } = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.total_amount = data.total_amount;
    this.status = data.status;
    this.shipping_address = data.shipping_address;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Order items if included
    this.items = data.items || [];
  }

  // Create a new order from cart
  static async create(userId, orderData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get cart items
      const cartResult = await client.query(`
        SELECT 
          c.product_id,
          c.quantity,
          p.price,
          p.available_quantity,
          p.discount,
          p.name as product_name
        FROM cart c
        JOIN product p ON c.product_id = p.id
        WHERE c.user_id = $1
      `, [userId]);

      if (cartResult.rows.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total amount and validate inventory
      let totalAmount = 0;
      const orderItems = [];
      
      for (const item of cartResult.rows) {
        // Check inventory
        if (item.quantity > item.available_quantity) {
          throw new Error(`Insufficient inventory for ${item.product_name}. Available: ${item.available_quantity}, Requested: ${item.quantity}`);
        }
        
        // Calculate item price with discount
        let itemPrice = item.price;
        if (item.discount && item.discount > 0) {
          itemPrice = item.price * (1 - item.discount / 100);
        }
        
        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: itemPrice,
          total: itemTotal
        });
      }

      // Create order
      const orderResult = await client.query(`
        INSERT INTO "order" (
          user_id, 
          total_amount, 
          status, 
          shipping_address, 
          payment_method,
          payment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        userId,
        Math.round(totalAmount), // Convert to cents
        orderData.status || 'pending',
        JSON.stringify(orderData.shipping_address),
        orderData.payment_method || 'pending',
        orderData.payment_status || 'pending'
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of orderItems) {
        await client.query(`
          INSERT INTO order_item (order_id, product_id, quantity, price, total)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          order.id,
          item.product_id,
          item.quantity,
          Math.round(item.price), // Convert to cents
          Math.round(item.total)   // Convert to cents
        ]);

        // Update product inventory
        await client.query(`
          UPDATE product 
          SET available_quantity = available_quantity - $2
          WHERE id = $1
        `, [item.product_id, item.quantity]);
      }

      // Clear cart
      await client.query(`
        DELETE FROM cart WHERE user_id = $1
      `, [userId]);

      await client.query('COMMIT');

      // Return complete order with items
      return await this.findById(order.id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get order by ID with items
  static async findById(orderId) {
    try {
      // Get order details
      const orderResult = await db.query(`
        SELECT * FROM "order" WHERE id = $1
      `, [orderId]);

      if (orderResult.rows.length === 0) {
        return null;
      }

      const orderData = orderResult.rows[0];

      // Get order items
      const itemsResult = await db.query(`
        SELECT 
          oi.*,
          p.name as product_name,
          p.description as product_description,
          s.name as salon_name
        FROM order_item oi
        JOIN product p ON oi.product_id = p.id
        JOIN salon s ON p.salon_id = s.id
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `, [orderId]);

      orderData.items = itemsResult.rows;
      
      // Parse shipping address if it's JSON string
      if (typeof orderData.shipping_address === 'string') {
        try {
          orderData.shipping_address = JSON.parse(orderData.shipping_address);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }

      return new Order(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get orders by user ID
  static async findByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await db.query(`
        SELECT COUNT(*) as total FROM "order" WHERE user_id = $1
      `, [userId]);
      
      const totalItems = parseInt(countResult.rows[0].total);
      
      // Get orders
      const ordersResult = await db.query(`
        SELECT * FROM "order" 
        WHERE user_id = $1 
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      const orders = [];
      
      // Get items for each order
      for (const orderData of ordersResult.rows) {
        const itemsResult = await db.query(`
          SELECT 
            oi.*,
            p.name as product_name,
            p.description as product_description,
            s.name as salon_name
          FROM order_item oi
          JOIN product p ON oi.product_id = p.id
          JOIN salon s ON p.salon_id = s.id
          WHERE oi.order_id = $1
          ORDER BY oi.id
        `, [orderData.id]);

        orderData.items = itemsResult.rows;
        
        // Parse shipping address if it's JSON string
        if (typeof orderData.shipping_address === 'string') {
          try {
            orderData.shipping_address = JSON.parse(orderData.shipping_address);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }

        orders.push(new Order(orderData));
      }

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Update order status
  static async updateStatus(orderId, status) {
    try {
      const result = await db.query(`
        UPDATE "order" 
        SET status = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [orderId, status]);

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return await this.findById(orderId);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const result = await db.query(`
        UPDATE "order" 
        SET payment_status = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [orderId, paymentStatus]);

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return await this.findById(orderId);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}

module.exports = Order;
