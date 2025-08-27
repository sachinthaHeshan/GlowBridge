const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Remove mock cart imports since we're fixing the real database issue

// GET /api/cart - Get user's cart items
router.get('/', async (req, res) => {
  try {
    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = 2; // Using the test user we just created
    
    const cartItems = await Cart.getByUserId(userId);
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      error: 'Failed to fetch cart items'
    });
  }
});

// POST /api/cart - Add item to cart
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    
    if (!product_id) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        error: 'Quantity must be a positive number'
      });
    }

    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = 2; // Using the test user we just created
    
    const cartItem = await Cart.addItem(userId, product_id, quantity);
    
    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    let errorMessage = 'Failed to add item to cart';
    let statusCode = 500;
    
    if (error.message.includes('Product not found')) {
      errorMessage = 'Product not found';
      statusCode = 404;
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

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        error: 'Quantity must be a positive number'
      });
    }

    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = 2;
    
    const cartItem = await Cart.updateQuantity(userId, productId, quantity);
    
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    
    let errorMessage = 'Failed to update cart item';
    let statusCode = 500;
    
    if (error.message.includes('Cart item not found')) {
      errorMessage = 'Cart item not found';
      statusCode = 404;
    } else if (error.message.includes('Product not found')) {
      errorMessage = 'Product not found';
      statusCode = 404;
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

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = 2;
    
    await Cart.removeItem(userId, productId);
    
    res.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    
    if (error.message.includes('Cart item not found')) {
      return res.status(404).json({
        error: 'Cart item not found'
      });
    }
    
    res.status(500).json({
      error: 'Failed to remove cart item'
    });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', async (req, res) => {
  try {
    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = 2;
    
    await Cart.clearCart(userId);
    
    res.json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      error: 'Failed to clear cart'
    });
  }
});

// GET /api/cart/total - Get cart total
router.get('/total', async (req, res) => {
  try {
    // For now using a hardcoded user ID until authentication is implemented
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = 2;
    
    const total = await Cart.getCartTotal(userId);
    
    res.json(total);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    res.status(500).json({
      error: 'Failed to calculate cart total'
    });
  }
});

module.exports = router;
