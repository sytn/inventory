const { body, param, query, validationResult } = require('express-validator');

// Product validation rules
const validateProduct = [
  body('product_code')
    .notEmpty().withMessage('Product code is required')
    .isLength({ max: 20 }).withMessage('Product code must be less than 20 characters'),
  
  body('cloth_type')
    .isIn(['DRESS', 'BLOUSE', 'SKIRT', 'TOP', 'PANTS']).withMessage('Invalid cloth type'),
  
  body('fabric_type')
    .isIn(['COTTON', 'SILK', 'DENIM', 'LINEN', 'POLYESTER', 'WOOL']).withMessage('Invalid fabric type'),
  
  body('color')
    .notEmpty().withMessage('Color is required')
    .isLength({ max: 50 }).withMessage('Color must be less than 50 characters'),
  
  body('size_set')
    .isIn(['STANDARD', 'PLUS']).withMessage('Size set must be STANDARD or PLUS'),
  
  body('unit_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number')
];

// Inventory validation rules
const validateInventoryUpdate = [
  param('productId')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  
  body('quantity')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

// Stock movement validation rules
const validateStockMovement = [
  body('product_id')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  
  body('movement_type')
    .isIn(['IN', 'OUT']).withMessage('Movement type must be IN or OUT'),
  
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  
  body('reason')
    .isIn(['PURCHASE', 'SALE', 'DAMAGE', 'RETURN', 'ADJUSTMENT']).withMessage('Invalid reason'),
  
  body('created_by')
    .optional()
    .isLength({ max: 100 }).withMessage('Created by must be less than 100 characters')
];

// Search validation rules
const validateSearch = [
  query('cloth_type')
    .optional()
    .isIn(['DRESS', 'BLOUSE', 'SKIRT', 'TOP', 'PANTS']).withMessage('Invalid cloth type'),
  
  query('fabric_type')
    .optional()
    .isIn(['COTTON', 'SILK', 'DENIM', 'LINEN', 'POLYESTER', 'WOOL']).withMessage('Invalid fabric type'),
  
  query('size_set')
    .optional()
    .isIn(['STANDARD', 'PLUS']).withMessage('Invalid size set')
];

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  validateProduct,
  validateInventoryUpdate,
  validateStockMovement,
  validateSearch,
  handleValidationErrors
};