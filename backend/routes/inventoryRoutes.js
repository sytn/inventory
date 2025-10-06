const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { validateInventoryUpdate, handleValidationErrors } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.get('/inventory', authMiddleware(), inventoryController.getAllInventory);
router.post('/inventory', authMiddleware(['admin']), inventoryController.createInventory);
router.get('/inventory/low-stock', authMiddleware(), inventoryController.getLowStock);
router.get('/inventory/product/:productId', authMiddleware(), inventoryController.getInventoryByProduct);
router.put('/inventory/product/:productId/stock', authMiddleware(), inventoryController.updateStock);

module.exports = router;