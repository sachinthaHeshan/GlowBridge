import { db, PoolClient } from '@/lib/database';
import { 
  CheckoutOrder, 
  CustomerDetails, 
  ShippingDetails,
  OrderSummary,
  OrderItemWithProduct 
} from '@/types/order';

export class OrderService {
  // Create a new order with items
  static async createOrder(
    customerDetails: CustomerDetails,
    shippingDetails: ShippingDetails,
    orderSummary: OrderSummary,
    items: OrderItemWithProduct[]
  ): Promise<string> {
    return await db.transaction(async (client: PoolClient) => {
      try {
        // First, create the user if doesn't exist
        let userId: string;
        const userResult = await client.query(
          'SELECT id FROM "user" WHERE email = $1',
          [customerDetails.email]
        );

        if (userResult.rows.length > 0) {
          userId = userResult.rows[0].id;
        } else {
          const newUserResult = await client.query(`
            INSERT INTO "user" (
              first_name, 
              last_name, 
              email, 
              phone_number, 
              address_line_1, 
              address_line_2, 
              city, 
              state, 
              postal_code, 
              country,
              role
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'customer')
            RETURNING id
          `, [
            customerDetails.firstName,
            customerDetails.lastName,
            customerDetails.email,
            customerDetails.phone,
            shippingDetails.addressLine1,
            shippingDetails.addressLine2 || null,
            shippingDetails.city,
            shippingDetails.province,
            shippingDetails.postalCode,
            'Sri Lanka'
          ]);
          userId = newUserResult.rows[0].id;
        }

        // Create the order
        const orderResult = await client.query(`
          INSERT INTO "order" (
            user_id,
            order_date,
            total_amount,
            status,
            shipping_address,
            shipping_city,
            shipping_province,
            shipping_postal_code,
            shipping_country,
            subtotal,
            shipping_cost,
            tax_amount,
            discount_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `, [
          userId,
          new Date(),
          Math.round(orderSummary.total * 100), // Convert to cents
          'pending',
          `${shippingDetails.addressLine1}${shippingDetails.addressLine2 ? ', ' + shippingDetails.addressLine2 : ''}`,
          shippingDetails.city,
          shippingDetails.province,
          shippingDetails.postalCode,
          'Sri Lanka',
          Math.round(orderSummary.subtotal * 100),
          Math.round(orderSummary.shippingCost * 100),
          Math.round(orderSummary.tax * 100),
          Math.round((orderSummary.discount || 0) * 100)
        ]);

        const orderId = orderResult.rows[0].id;

        // Create order items and update inventory
        for (const item of items) {
          // Create order item
          await client.query(`
            INSERT INTO order_item (
              order_id,
              product_id,
              quantity,
              unit_price,
              total_price
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            orderId,
            item.productId,
            item.quantity,
            Math.round(item.price * 100), // Convert to cents
            Math.round(item.price * item.quantity * 100)
          ]);

          // Update product inventory
          const inventoryResult = await client.query(`
            UPDATE product 
            SET available_quantity = available_quantity - $2
            WHERE id = $1 AND available_quantity >= $2
            RETURNING available_quantity
          `, [item.productId, item.quantity]);

          if (inventoryResult.rowCount === 0) {
            throw new Error(`Insufficient inventory for product ${item.name}`);
          }
        }

        // Create order tracking entry
        await client.query(`
          INSERT INTO order_tracking (
            order_id,
            status,
            status_date,
            location,
            notes
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          orderId,
          'pending',
          new Date(),
          'Order Processing Center',
          'Order received and being prepared'
        ]);

        return orderId;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    });
  }

  // Get order by ID with items
  static async getOrderById(orderId: string): Promise<CheckoutOrder | null> {
    try {
      // Get order details
      const orderResult = await db.query(`
        SELECT 
          o.id,
          o.user_id,
          o.order_date,
          o.total_amount,
          o.status,
          o.shipping_address,
          o.shipping_city,
          o.shipping_province,
          o.shipping_postal_code,
          o.shipping_country,
          o.subtotal,
          o.shipping_cost,
          o.tax_amount,
          o.discount_amount,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number
        FROM "order" o
        JOIN "user" u ON o.user_id = u.id
        WHERE o.id = $1
      `, [orderId]);

      if (orderResult.rows.length === 0) {
        return null;
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await db.query(`
        SELECT 
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          p.name,
          p.description,
          s.name as salon_name
        FROM order_item oi
        JOIN product p ON oi.product_id = p.id
        JOIN salon s ON p.salon_id = s.id
        WHERE oi.order_id = $1
      `, [orderId]);

      const items: OrderItemWithProduct[] = itemsResult.rows.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        description: item.description,
        price: item.unit_price / 100, // Convert from cents
        quantity: item.quantity,
        salon: item.salon_name
      }));

      return {
        id: order.id,
        items,
        customerDetails: {
          firstName: order.first_name,
          lastName: order.last_name,
          email: order.email,
          phone: order.phone_number
        },
        shippingDetails: {
          addressLine1: order.shipping_address.split(',')[0],
          addressLine2: order.shipping_address.split(',')[1] || '',
          city: order.shipping_city,
          province: order.shipping_province,
          postalCode: order.shipping_postal_code,
          country: order.shipping_country
        },
        orderSummary: {
          subtotal: order.subtotal / 100,
          shippingCost: order.shipping_cost / 100,
          tax: order.tax_amount / 100,
          discount: order.discount_amount / 100,
          total: order.total_amount / 100
        },
        status: order.status,
        orderDate: order.order_date,
        paymentStatus: 'pending' // This would come from payment_transaction table
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    return await db.transaction(async (client: PoolClient) => {
      try {
        // Update order status
        const orderResult = await client.query(`
          UPDATE "order" 
          SET status = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING id
        `, [orderId, status]);

        if (orderResult.rowCount === 0) {
          return false;
        }

        // Add tracking entry
        const statusMessages: { [key: string]: string } = {
          'confirmed': 'Order confirmed and being prepared',
          'processing': 'Order is being processed',
          'shipped': 'Order has been shipped',
          'delivered': 'Order has been delivered',
          'cancelled': 'Order has been cancelled'
        };

        await client.query(`
          INSERT INTO order_tracking (
            order_id,
            status,
            status_date,
            location,
            notes
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          orderId,
          status,
          new Date(),
          status === 'shipped' ? 'In Transit' : 'Order Processing Center',
          statusMessages[status] || `Order status updated to ${status}`
        ]);

        return true;
      } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
    });
  }

  // Get order tracking history
  static async getOrderTracking(orderId: string) {
    try {
      const result = await db.query(`
        SELECT 
          status,
          status_date,
          location,
          notes
        FROM order_tracking
        WHERE order_id = $1
        ORDER BY status_date ASC
      `, [orderId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw new Error('Failed to fetch order tracking');
    }
  }

  // Get orders by user email
  static async getOrdersByUser(email: string, limit = 10, offset = 0) {
    try {
      const result = await db.query(`
        SELECT 
          o.id,
          o.order_date,
          o.total_amount,
          o.status,
          COUNT(oi.id) as item_count
        FROM "order" o
        JOIN "user" u ON o.user_id = u.id
        LEFT JOIN order_item oi ON o.id = oi.order_id
        WHERE u.email = $1
        GROUP BY o.id, o.order_date, o.total_amount, o.status
        ORDER BY o.order_date DESC
        LIMIT $2 OFFSET $3
      `, [email, limit, offset]);

      return result.rows.map(row => ({
        id: row.id,
        orderDate: row.order_date,
        totalAmount: row.total_amount / 100,
        status: row.status,
        itemCount: parseInt(row.item_count)
      }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  }
}

export default OrderService;
