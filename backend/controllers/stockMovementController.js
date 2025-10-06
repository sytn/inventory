const StockMovement = require('../models/StockMovement');
const Inventory = require('../models/Inventory');

const stockMovementController = {
  // Create stock movement and update inventory
  async createMovement(req, res) {
    try {
      const { product_id, movement_type, quantity, reason, notes } = req.body;

      // Validate movement data
      if (!['IN', 'OUT'].includes(movement_type)) {
        return res.status(400).json({ error: 'Movement type must be IN or OUT' });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be positive' });
      }

      // Get current inventory
      const currentInventory = await Inventory.findByProductId(product_id);
      if (!currentInventory) {
        return res.status(404).json({ error: 'Inventory not found for this product' });
      }

      // Check stock availability for OUT movements
      if (movement_type === 'OUT' && quantity > currentInventory.stock_quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${currentInventory.stock_quantity}, Requested: ${quantity}` 
        });
      }

      // Create stock movement with authenticated user
      const movement = await StockMovement.create({
        product_id,
        movement_type,
        quantity,
        reason,
        notes,
        created_by: req.user.username // Use authenticated user
      });

      // Update inventory
      const newQuantity = movement_type === 'IN' 
        ? currentInventory.stock_quantity + quantity
        : currentInventory.stock_quantity - quantity;

      await Inventory.updateStock(product_id, newQuantity);

      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all stock movements
  async getAllMovements(req, res) {
    try {
      const movements = await StockMovement.findAll();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get movements by product
  async getMovementsByProduct(req, res) {
    try {
      const movements = await StockMovement.findByProductId(req.params.productId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get movements by date range
  async getMovementsByDate(req, res) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const movements = await StockMovement.getMovementsByDateRange(startDate, endDate);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = stockMovementController;