const Inventory = require('../models/Inventory');

const inventoryController = {
  // Get all inventory
  async getAllInventory(req, res) {
    try {
      const inventory = await Inventory.findAll();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create inventory
  async createInventory(req, res) {
    try {
      const { product_id } = req.body;
      const inventory = await Inventory.create(product_id);
      res.status(201).json(inventory);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get inventory by product ID
  async getInventoryByProduct(req, res) {
    try {
      const inventory = await Inventory.findByProductId(req.params.productId);
      if (!inventory) {
        return res.status(404).json({ error: 'Inventory not found' });
      }
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update stock quantity
  async updateStock(req, res) {
    try {
      const { quantity } = req.body;
      const inventory = await Inventory.updateStock(req.params.productId, quantity);
      res.json(inventory);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get low stock items
  async getLowStock(req, res) {
    try {
      const lowStockItems = await Inventory.getLowStock();
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = inventoryController;