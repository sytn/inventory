const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    body: req.body,
    error: err.message,
    stack: err.stack
  });

  // Supabase errors
  if (err.code && err.code.startsWith('2')) {
    return res.status(400).json({
      error: 'Database error',
      message: err.message,
      code: err.code
    });
  }

  // Validation errors (already handled by express-validator)
  if (err.status === 400 && err.details) {
    return res.status(400).json(err);
  }

  // Custom business logic errors
  if (err.message.includes('cannot be negative') || 
      err.message.includes('Insufficient stock') ||
      err.message.includes('not found')) {
    return res.status(400).json({
      error: 'Business rule violation',
      message: err.message
    });
  }

  // Database constraint errors (unique, foreign key, etc.)
  if (err.message.includes('duplicate key') || err.message?.includes('unique constraint')) {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this data already exists'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.url} not found`
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};