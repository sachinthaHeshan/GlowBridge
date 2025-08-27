const Joi = require('joi');

// Validation schemas
const registrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{10,15}$/).optional(),
  address: Joi.string().max(500).optional()
});

const loginSchema = Joi.object({
  username: Joi.string().required(), // Can be username or email
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().positive().required(),
  available_quantity: Joi.number().integer().min(0).required(),
  salon_id: Joi.string().uuid().required(),
  discount: Joi.number().min(0).max(100).optional()
});

const cartItemSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required()
});

const orderSchema = Joi.object({
  shipping_address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  payment_method: Joi.string().valid('card', 'paypal', 'bank_transfer').optional(),
  payment_status: Joi.string().valid('pending', 'processing', 'completed', 'failed').optional()
});

// Middleware functions
const validateRegistration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

const validateCartItem = (req, res, next) => {
  const { error } = cartItemSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

const validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

// General validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateCartItem,
  validateOrder,
  validate,
  schemas: {
    registrationSchema,
    loginSchema,
    productSchema,
    cartItemSchema,
    orderSchema
  }
};
