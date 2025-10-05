const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovementController');
const { validateStockMovement, handleValidationErrors } = require('../middleware/validation');

router.post('/stock-movements', validateStockMovement, handleValidationErrors, stockMovementController.createMovement);
router.get('/stock-movements', stockMovementController.getAllMovements);
router.get('/stock-movements/product/:productId', stockMovementController.getMovementsByProduct);
router.get('/stock-movements/by-date', stockMovementController.getMovementsByDate);

module.exports = router;