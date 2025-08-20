import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    const { order_id } = await params;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details
    const orderResult = await db.query(`
      SELECT 
        o.id,
        o.user_id,
        o.description,
        o.payment_type,
        o.amount,
        o.is_paid,
        u.first_name,
        u.last_name,
        u.email,
        u.contact_number
      FROM "order" o
      JOIN "user" u ON o.user_id = u.id
      WHERE o.id = $1
    `, [order_id]);

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await db.query(`
      SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        p.name as product_name,
        p.price,
        p.discount,
        s.name as salon_name
      FROM order_item oi
      JOIN product p ON oi.product_id = p.id
      JOIN salon s ON p.salon_id = s.id
      WHERE oi.user_id = $1
      AND EXISTS (
        SELECT 1 FROM "order" WHERE id = $2 AND user_id = $1
      )
    `, [order.user_id, order_id]);

    const orderItems = itemsResult.rows.map(item => ({
      id: item.id,
      productName: item.product_name,
      salonName: item.salon_name,
      quantity: item.quantity,
      unitPrice: item.price,
      discount: item.discount || 0,
      totalPrice: (item.price - (item.discount || 0)) * item.quantity
    }));

    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    // Create tracking timeline
    const trackingUpdates = [
      {
        status: 'Order Placed',
        description: 'Your order has been placed and confirmed',
        timestamp: new Date().toISOString(),
        completed: true
      },
      {
        status: 'Payment Confirmed',
        description: order.is_paid ? 'Payment has been confirmed' : 'Awaiting payment confirmation',
        timestamp: order.is_paid ? new Date().toISOString() : null,
        completed: order.is_paid
      },
      {
        status: 'Processing',
        description: 'Your order is being prepared',
        timestamp: order.is_paid ? new Date().toISOString() : null,
        completed: order.is_paid
      },
      {
        status: 'Shipped',
        description: 'Your order has been shipped',
        timestamp: null,
        completed: false
      },
      {
        status: 'Delivered',
        description: `Estimated delivery: ${estimatedDelivery.toLocaleDateString()}`,
        timestamp: null,
        completed: false
      }
    ];

    const response = {
      orderId: order.id,
      orderNumber: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      status: order.is_paid ? 'processing' : 'pending_payment',
      paymentStatus: order.is_paid ? 'completed' : 'pending',
      estimatedDelivery: estimatedDelivery.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      trackingNumber: `TRK-${Date.now()}`,
      customerDetails: {
        firstName: order.first_name,
        lastName: order.last_name,
        email: order.email,
        contactNumber: order.contact_number
      },
      orderSummary: {
        subtotal: orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
        discount: orderItems.reduce((sum, item) => sum + (item.discount * item.quantity), 0),
        total: order.amount,
        itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0)
      },
      items: orderItems,
      trackingUpdates
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order tracking' },
      { status: 500 }
    );
  }
}