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

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalDiscount = orderItems.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
    const deliveryFee = subtotal > 10000 ? 0 : 500;
    const tax = Math.round((subtotal - totalDiscount) * 0.02);

    // Generate HTML invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .invoice-title { font-size: 20px; margin-top: 10px; }
          .order-info { margin-bottom: 30px; }
          .customer-info { margin-bottom: 30px; }
          .info-section { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .info-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f0f9ff; }
          .summary-table { margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          .payment-status { padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
          .paid { background-color: #d1fae5; color: #065f46; }
          .pending { background-color: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">GlowBridge Beauty Marketplace</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="order-info">
          <div class="info-section">
            <div class="info-title">Order Information</div>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Number:</strong> ORD-${order.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.payment_type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Payment Status:</strong> 
              <span class="payment-status ${order.is_paid ? 'paid' : 'pending'}">
                ${order.is_paid ? 'PAID' : 'PENDING'}
              </span>
            </p>
          </div>
        </div>

        <div class="customer-info">
          <div class="info-section">
            <div class="info-title">Customer Information</div>
            <p><strong>Name:</strong> ${order.first_name} ${order.last_name}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Contact:</strong> ${order.contact_number}</p>
          </div>
        </div>

        <div class="info-title">Order Items</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Salon</th>
              <th>Quantity</th>
              <th>Unit Price (LKR)</th>
              <th>Discount (LKR)</th>
              <th>Total (LKR)</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.salonName}</td>
                <td>${item.quantity}</td>
                <td>${(item.unitPrice / 100).toFixed(2)}</td>
                <td>${(item.discount / 100).toFixed(2)}</td>
                <td>${(item.totalPrice / 100).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="summary-table">
          <tr>
            <td style="border: none; width: 60%;"></td>
            <td><strong>Subtotal:</strong></td>
            <td><strong>LKR ${(subtotal / 100).toFixed(2)}</strong></td>
          </tr>
          ${totalDiscount > 0 ? `
          <tr>
            <td style="border: none;"></td>
            <td><strong>Discount:</strong></td>
            <td><strong style="color: green;">-LKR ${(totalDiscount / 100).toFixed(2)}</strong></td>
          </tr>
          ` : ''}
          <tr>
            <td style="border: none;"></td>
            <td><strong>Delivery Fee:</strong></td>
            <td><strong>${deliveryFee === 0 ? 'FREE' : `LKR ${(deliveryFee / 100).toFixed(2)}`}</strong></td>
          </tr>
          <tr>
            <td style="border: none;"></td>
            <td><strong>Tax (2%):</strong></td>
            <td><strong>LKR ${(tax / 100).toFixed(2)}</strong></td>
          </tr>
          <tr class="total-row">
            <td style="border: none;"></td>
            <td><strong>TOTAL:</strong></td>
            <td><strong>LKR ${(order.amount / 100).toFixed(2)}</strong></td>
          </tr>
        </table>

        <div class="footer">
          <p>Thank you for shopping with GlowBridge Beauty Marketplace!</p>
          <p>For any queries, please contact us at support@glowbridge.com</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </body>
      </html>
    `;

    return new Response(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${order_id}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}