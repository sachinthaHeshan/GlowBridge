const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders - Create a new order from cart
router.post('/', async (req, res) => {
  try {
    const {
      shipping_address,
      payment_method = 'pending',
      payment_status = 'pending'
    } = req.body;

    if (!shipping_address) {
      return res.status(400).json({
        error: 'Shipping address is required'
      });
    }

    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';

    const orderData = {
      shipping_address,
      payment_method,
      payment_status,
      status: 'pending'
    };

    const order = await Order.create(userId, orderData);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    let errorMessage = 'Failed to create order';
    let statusCode = 500;
    
    if (error.message.includes('Cart is empty')) {
      errorMessage = 'Cart is empty';
      statusCode = 400;
    } else if (error.message.includes('Insufficient inventory')) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      error: errorMessage
    });
  }
});

// GET /api/orders - Get user's orders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';

    const result = await Order.findByUserId(userId, parsedPage, parsedLimit);

    res.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // TODO: Add authorization check to ensure user can access this order

    res.json({
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Failed to fetch order'
    });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.updateStatus(id, status);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    
    if (error.message.includes('Order not found')) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update order status'
    });
  }
});

// PUT /api/orders/:id/payment - Update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status) {
      return res.status(400).json({
        error: 'Payment status is required'
      });
    }

    const validPaymentStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }

    const order = await Order.updatePaymentStatus(id, payment_status);

    res.json({
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    
    if (error.message.includes('Order not found')) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update payment status'
    });
  }
});

// GET /api/orders/track/:id - Track order status
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Return minimal tracking information
    res.json({
      order_id: order.id,
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      total_amount: order.total_amount
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({
      error: 'Failed to track order'
    });
  }
});

module.exports = router;
