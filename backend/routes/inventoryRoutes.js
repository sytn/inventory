const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { validateInventoryUpdate, handleValidationErrors } = require('../middleware/validation');

router.get('/inventory', inventoryController.getAllInventory);
router.post('/inventory', inventoryController.createInventory);
router.get('/inventory/low-stock', inventoryController.getLowStock);
router.get('/inventory/product/:productId', inventoryController.getInventoryByProduct);
router.put('/inventory/product/:productId/stock', validateInventoryUpdate, handleValidationErrors, inventoryController.updateStock);

module.exports = router;