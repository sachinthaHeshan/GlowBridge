const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isDatabaseReady } = require('../config/database');

// Mock products for when database is unavailable
const mockProducts = [
  {
    id: '1',
    name: 'Professional Eyebrow Styling Kit',
    description: 'Complete eyebrow styling kit with tweezers, scissors, and shaping gel. Perfect for achieving professionally styled eyebrows at home.',
    price: 2500,
    available_quantity: 15,
    salon_name: 'Glamour Beauty Salon',
    category: 'Beauty Tools',
    discount: 0,
    is_public: true
  },
  {
    id: '2', 
    name: 'Luxury Face Moisturizer',
    description: 'Premium anti-aging moisturizer with natural ingredients including hyaluronic acid and vitamin E. Suitable for all skin types.',
    price: 4500,
    available_quantity: 8,
    salon_name: 'Glamour Beauty Salon',
    category: 'Skincare',
    discount: 10,
    is_public: true
  },
  {
    id: '3',
    name: 'Professional Makeup Brush Set',
    description: '12-piece professional makeup brush set for all your beauty needs. Includes brushes for foundation, eyeshadow, blush and more.',
    price: 3500,
    available_quantity: 12,
    salon_name: 'Glamour Beauty Salon',
    category: 'Makeup Tools',
    discount: 0,
    is_public: true
  },
  {
    id: '4',
    name: 'Organic Hair Treatment Oil',
    description: 'Nourishing hair oil made with organic argan and coconut oil. Repairs damaged hair and adds natural shine.',
    price: 2800,
    available_quantity: 20,
    salon_name: 'Glamour Beauty Salon',
    category: 'Hair Care',
    discount: 5,
    is_public: true
  },
  {
    id: '5',
    name: 'Diamond Glow Face Mask',
    description: 'Luxury face mask with diamond particles for ultimate glow. Provides deep hydration and luminous skin.',
    price: 6500,
    available_quantity: 5,
    salon_name: 'Glamour Beauty Salon',
    category: 'Skincare',
    discount: 15,
    is_public: true
  },
  {
    id: '6',
    name: 'Professional Nail Art Kit',
    description: 'Complete nail art kit with colors, tools, and accessories. Perfect for creating salon-quality nail designs at home.',
    price: 3200,
    available_quantity: 10,
    salon_name: 'Glamour Beauty Salon',
    category: 'Nail Care',
    discount: 0,
    is_public: true
  }
];

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
