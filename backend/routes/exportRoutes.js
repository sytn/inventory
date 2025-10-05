const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.get('/export/inventory/csv', exportController.exportInventoryCSV);
router.get('/export/inventory/excel', exportController.exportInventoryExcel);
router.get('/export/movements/csv', exportController.exportMovementsCSV);
router.get('/export/low-stock/csv', exportController.exportLowStockCSV);

module.exports = router;