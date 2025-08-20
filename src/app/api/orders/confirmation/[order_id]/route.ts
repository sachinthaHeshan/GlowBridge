import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { order_id: string } }
) {
  try {
    const orderId = params.order_id;

    if (!orderId) {
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
    `, [orderId]);

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
    `, [order.user_id, orderId]);

    const orderItems = itemsResult.rows.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productImage: '/placeholder-product.jpg',
      salonName: item.salon_name,
      quantity: item.quantity,
      unitPrice: item.price,
      discount: item.discount || 0,
      totalPrice: (item.price - (item.discount || 0)) * item.quantity
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalDiscount = orderItems.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
    const deliveryFee = subtotal > 10000 ? 0 : 500;
    const tax = Math.round((subtotal - totalDiscount) * 0.02);

    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const confirmation = {
      orderId: order.id,
      orderNumber: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      status: 'confirmed',
      paymentStatus: order.is_paid ? 'completed' : 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      trackingNumber: `TRK-${Date.now()}`,
      invoiceUrl: `/api/invoice/${order.id}`,
      customerDetails: {
        firstName: order.first_name,
        lastName: order.last_name,
        email: order.email,
        contactNumber: order.contact_number
      },
      deliveryAddress: {
        addressLine1: 'Default Address Line 1',
        city: 'Colombo',
        state: 'Western Province',
        postalCode: '00100',
        country: 'Sri Lanka'
      },
      orderSummary: {
        subtotal,
        discount: totalDiscount,
        deliveryFee,
        processingFee: order.payment_type === 'cash_on_delivery' ? 500 : 0,
        tax,
        total: order.amount,
        estimatedDelivery: estimatedDelivery.toLocaleDateString(),
        itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0)
      },
      items: orderItems
    };

    return NextResponse.json(confirmation);

  } catch (error) {
    console.error('Error fetching order confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order confirmation' },
      { status: 500 }
    );
  }
}
