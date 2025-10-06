const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovementController');
const { validateStockMovement, handleValidationErrors } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/stock-movements', authMiddleware(), stockMovementController.createMovement);
router.get('/stock-movements', authMiddleware(), stockMovementController.getAllMovements);
router.get('/stock-movements/product/:productId', authMiddleware(), stockMovementController.getMovementsByProduct);
router.get('/stock-movements/by-date', authMiddleware(), stockMovementController.getMovementsByDate);

module.exports = router;