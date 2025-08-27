const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      limit = 12,
      page = 1,
      category,
      minPrice,
      maxPrice,
      search,
      id,
      salon_id,
      in_stock_only,
      has_discount
    } = req.query;

    // Parse numeric values
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const parsedMinPrice = minPrice ? parseFloat(minPrice) : undefined;
    const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : undefined;

    // If searching for a specific product by ID
    if (id) {
      const product = await Product.findById(id);
      if (product) {
        return res.json({
          data: [product],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            itemsPerPage: 1,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      } else {
        return res.json({
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: parsedLimit,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      }
    }

    // Build filters object
    const filters = {};
    if (search) filters.search = search;
    if (parsedMinPrice !== undefined) filters.min_price = parsedMinPrice;
    if (parsedMaxPrice !== undefined) filters.max_price = parsedMaxPrice;
    if (salon_id) filters.salon_id = salon_id;
    if (in_stock_only === 'true') filters.in_stock_only = true;
    if (has_discount === 'true') filters.has_discount = true;

    const result = await Product.getAll(filters, parsedPage, parsedLimit);

    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 12,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
});

// GET /api/products/:id - Get a specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json({
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Failed to fetch product'
    });
  }
});

// GET /api/products/salon/:salonId - Get products by salon
router.get('/salon/:salonId', async (req, res) => {
  try {
    const { salonId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    
    const result = await Product.findBySalon(salonId, parsedPage, parsedLimit);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching salon products:', error);
    res.status(500).json({
      error: 'Failed to fetch salon products',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 12,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
});

// PUT /api/products/:id/inventory - Update product inventory
router.put('/:id/inventory', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange } = req.body;
    
    if (typeof quantityChange !== 'number') {
      return res.status(400).json({
        error: 'quantityChange must be a number'
      });
    }
    
    const success = await Product.updateInventory(id, quantityChange);
    
    if (!success) {
      return res.status(400).json({
        error: 'Failed to update inventory - insufficient stock or product not found'
      });
    }
    
    res.json({
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      error: 'Failed to update inventory'
    });
  }
});

// GET /api/products/:id/inventory - Check product inventory
router.get('/:id/inventory/:quantity', async (req, res) => {
  try {
    const { id, quantity } = req.params;
    
    const requestedQuantity = parseInt(quantity);
    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return res.status(400).json({
        error: 'Invalid quantity'
      });
    }
    
    const available = await Product.checkInventory(id, requestedQuantity);
    
    res.json({
      available,
      productId: id,
      requestedQuantity
    });
  } catch (error) {
    console.error('Error checking inventory:', error);
    res.status(500).json({
      error: 'Failed to check inventory'
    });
  }
});

module.exports = router;
