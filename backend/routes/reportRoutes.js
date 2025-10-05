const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/reports/inventory-summary', reportController.getInventorySummary);
router.get('/reports/low-stock', reportController.getLowStockReport);
router.get('/reports/stock-movements', reportController.getStockMovementReport);
router.get('/reports/fabric-summary', reportController.getFabricSummary);

module.exports = router;