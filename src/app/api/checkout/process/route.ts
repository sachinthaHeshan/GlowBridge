import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { 
  CheckoutFormData, 
  PaymentDetails, 
  OrderSummary,
  OrderConfirmation 
} from '@/types/checkout';
import { CartItem } from '@/types/cart';

const USER_ID = '1919f650-bb52-4d9d-a1c3-3667f57be959'; // Fixed user ID for now

export async function POST(request: NextRequest) {
  try {
    const {
      customerDetails,
      deliveryAddress,
      paymentDetails,
      cartItems,
      orderSummary,
      deliveryNotes,
      deliveryTimePreference
    }: {
      customerDetails: CheckoutFormData['customerDetails'];
      deliveryAddress: CheckoutFormData['deliveryAddress'];
      paymentDetails: PaymentDetails;
      cartItems: CartItem[];
      orderSummary: OrderSummary;
      deliveryNotes?: string;
      deliveryTimePreference: string;
    } = await request.json();

    // Validate required fields
    if (!customerDetails || !deliveryAddress || !paymentDetails || !cartItems) {
      return NextResponse.json(
        { error: 'Missing required checkout data' },
        { status: 400 }
      );
    }

    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // 1. Validate inventory one more time
      for (const item of cartItems) {
        if (!item.product) continue;
        
        const productResult = await client.query(
          'SELECT available_quantity, name FROM product WHERE id = $1',
          [item.product_id]
        );
        
        if (productResult.rows.length === 0) {
          throw new Error(`Product not found: ${item.product.name}`);
        }
        
        const availableQty = productResult.rows[0].available_quantity;
        if (availableQty < item.quantity) {
          throw new Error(
            `Insufficient stock for ${productResult.rows[0].name}. Available: ${availableQty}, Requested: ${item.quantity}`
          );
        }
      }

      // 2. Simulate payment processing
      const paymentResult = await simulatePayment(paymentDetails, orderSummary.total);
      
      if (!paymentResult.success) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: paymentResult.error },
          { status: 400 }
        );
      }

      // 3. Create the order
      const orderDescription = `Order for ${customerDetails.firstName} ${customerDetails.lastName}${deliveryNotes ? ` - ${deliveryNotes}` : ''}`;
      
      const orderResult = await client.query(`
        INSERT INTO "order" (
          id, user_id, description, payment_type, amount, is_paid
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5
        ) RETURNING id
      `, [
        USER_ID,
        orderDescription,
        paymentDetails.method.type,
        orderSummary.total,
        paymentDetails.method.type !== 'cash_on_delivery'
      ]);
      
      const orderId = orderResult.rows[0].id;

      // 4. Create order items and update inventory
      const orderItems = [];
      
      for (const item of cartItems) {
        if (!item.product) continue;
        
        // Create order item
        await client.query(`
          INSERT INTO order_item (
            id, user_id, product_id, quantity
          ) VALUES (
            gen_random_uuid(), $1, $2, $3
          )
        `, [USER_ID, item.product_id, item.quantity]);
        
        // Update product quantity
        await client.query(`
          UPDATE product 
          SET available_quantity = available_quantity - $1 
          WHERE id = $2
        `, [item.quantity, item.product_id]);

        // Collect order item info for response
        orderItems.push({
          id: `item_${Date.now()}_${Math.random()}`,
          productId: item.product_id,
          productName: item.product.name,
          productImage: '/placeholder-product.jpg',
          salonName: item.product.salon_name || 'Unknown Salon',
          quantity: item.quantity,
          unitPrice: item.product.price,
          discount: item.product.discount || 0,
          totalPrice: (item.product.price - (item.product.discount || 0)) * item.quantity
        });
      }

      // 5. Clear shopping cart
      await client.query(
        'DELETE FROM shopping_cart_item WHERE user_id = $1',
        [USER_ID]
      );

      await client.query('COMMIT');

      // 6. Calculate estimated delivery
      const estimatedDelivery = calculateEstimatedDelivery(deliveryTimePreference);

      // 7. Create order confirmation response
      const orderConfirmation: OrderConfirmation = {
        orderId,
        orderNumber: `ORD-${orderId.substr(0, 8).toUpperCase()}`,
        status: 'confirmed',
        paymentStatus: paymentDetails.method.type !== 'cash_on_delivery' ? 'completed' : 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery,
        trackingNumber: `TRK-${Date.now()}`,
        invoiceUrl: `/api/invoice/${orderId}`,
        customerDetails,
        deliveryAddress,
        orderSummary,
        items: orderItems
      };

      return NextResponse.json(orderConfirmation);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error processing order:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}

// Simulate payment processing
async function simulatePayment(paymentDetails: PaymentDetails, amount: number): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Cash on delivery always succeeds
  if (paymentDetails.method.type === 'cash_on_delivery') {
    return {
      success: true,
      transactionId: `COD_${Date.now()}`
    };
  }

  // Simulate payment scenarios
  const random = Math.random();
  
  if (random < 0.05) { // 5% chance of failure
    return {
      success: false,
      error: 'Payment declined. Please check your payment details and try again.'
    };
  }

  if (random < 0.02) { // 2% chance of network error
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }

  return {
    success: true,
    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// Calculate estimated delivery date
function calculateEstimatedDelivery(deliveryTimePreference: string): string {
  const baseDate = new Date();
  const deliveryDate = new Date(baseDate);

  // Add delivery days based on preference
  switch (deliveryTimePreference) {
    case 'morning':
    case 'afternoon':
    case 'evening':
      deliveryDate.setDate(baseDate.getDate() + 2);
      break;
    default:
      deliveryDate.setDate(baseDate.getDate() + 3);
  }

  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
