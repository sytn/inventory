const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct, validateSearch, handleValidationErrors } = require('../middleware/validation');

// Product routes
router.post('/products', validateProduct, handleValidationErrors, productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/products/search', validateSearch, handleValidationErrors, productController.searchProducts);
router.get('/products/:code', productController.getProductByCode);
router.put('/products/:code', validateProduct, handleValidationErrors, productController.updateProduct);
router.delete('/products/:code', productController.deleteProduct);

module.exports = router;