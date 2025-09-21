// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    error.message = 'Database connection failed';
    error.status = 503;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.details;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error.message = 'Duplicate entry';
        error.status = 409;
        break;
      case '23503': // Foreign key violation
        error.message = 'Referenced record not found';
        error.status = 400;
        break;
      case '23502': // Not null violation
        error.message = 'Required field missing';
        error.status = 400;
        break;
      case '42P01': // Undefined table
        error.message = 'Database table not found';
        error.status = 500;
        break;
      default:
        error.message = 'Database error';
        error.status = 500;
    }
  }

  // internal errors in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Internal Server Error';
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};
