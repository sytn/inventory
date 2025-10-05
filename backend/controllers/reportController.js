const { supabase } = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

const reportController = {
  // Inventory summary report
  getInventorySummary: asyncHandler(async (req, res) => {
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        stock_quantity,
        low_stock_threshold,
        products (
          product_code,
          cloth_type,
          fabric_type,
          color,
          size_set,
          unit_price
        )
      `);

    if (error) throw error;

    const summary = {
      totalProducts: inventory.length,
      totalStock: inventory.reduce((sum, item) => sum + item.stock_quantity, 0),
      totalValue: inventory.reduce((sum, item) => {
        const value = item.stock_quantity * (item.products.unit_price || 0);
        return sum + value;
      }, 0),
      lowStockItems: inventory.filter(item => item.stock_quantity <= item.low_stock_threshold).length,
      outOfStockItems: inventory.filter(item => item.stock_quantity === 0).length,
      byClothType: {},
      byFabricType: {},
      bySizeSet: {
        STANDARD: 0,
        PLUS: 0
      }
    };

    // Calculate breakdowns
    inventory.forEach(item => {
      // By cloth type
      const clothType = item.products.cloth_type;
      summary.byClothType[clothType] = (summary.byClothType[clothType] || 0) + 1;

      // By fabric type
      const fabricType = item.products.fabric_type;
      summary.byFabricType[fabricType] = (summary.byFabricType[fabricType] || 0) + 1;

      // By size set
      summary.bySizeSet[item.products.size_set]++;
    });

    res.json(summary);
  }),

  // Low stock report
getLowStockReport: asyncHandler(async (req, res) => {
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select(`
      stock_quantity,
      low_stock_threshold,
      products (
        product_code,
        cloth_type,
        fabric_type,
        color,
        size_set,
        unit_price
      )
    `);

  if (error) throw error;

  // Filter in JavaScript instead of using supabase.raw()
  const lowStock = inventory.filter(item => item.stock_quantity <= item.low_stock_threshold);

  const report = lowStock.map(item => ({
    product_code: item.products.product_code,
    cloth_type: item.products.cloth_type,
    fabric_type: item.products.fabric_type,
    color: item.products.color,
    size_set: item.products.size_set,
    current_stock: item.stock_quantity,
    low_stock_threshold: item.low_stock_threshold,
    unit_price: item.products.unit_price,
    status: item.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'
  }));

  res.json(report);
}),

  // Stock movement report
  getStockMovementReport: asyncHandler(async (req, res) => {
    const { startDate, endDate, movementType } = req.query;
    
    let query = supabase
      .from('stock_movements')
      .select(`
        movement_type,
        quantity,
        reason,
        movement_date,
        created_by,
        notes,
        products (
          product_code,
          cloth_type,
          fabric_type
        )
      `)
      .order('movement_date', { ascending: false });

    // Apply date filters
    if (startDate) {
      query = query.gte('movement_date', startDate);
    }
    if (endDate) {
      query = query.lte('movement_date', endDate);
    }
    if (movementType) {
      query = query.eq('movement_type', movementType);
    }

    const { data: movements, error } = await query;

    if (error) throw error;

    // Calculate summary
    const summary = {
      totalMovements: movements.length,
      totalIn: movements.filter(m => m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
      totalOut: movements.filter(m => m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
      movementsByReason: {},
      movementsByProduct: {}
    };

    movements.forEach(movement => {
      // By reason
      summary.movementsByReason[movement.reason] = (summary.movementsByReason[movement.reason] || 0) + movement.quantity;
      
      // By product
      const productCode = movement.products.product_code;
      if (!summary.movementsByProduct[productCode]) {
        summary.movementsByProduct[productCode] = { IN: 0, OUT: 0 };
      }
      summary.movementsByProduct[productCode][movement.movement_type] += movement.quantity;
    });

    res.json({
      summary,
      movements
    });
  }),

  // Fabric type summary report
  getFabricSummary: asyncHandler(async (req, res) => {
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        stock_quantity,
        products (
          fabric_type,
          unit_price
        )
      `);

    if (error) throw error;

    const fabricSummary = {};

    inventory.forEach(item => {
      const fabricType = item.products.fabric_type;
      if (!fabricSummary[fabricType]) {
        fabricSummary[fabricType] = {
          count: 0,
          totalStock: 0,
          totalValue: 0
        };
      }

      fabricSummary[fabricType].count++;
      fabricSummary[fabricType].totalStock += item.stock_quantity;
      fabricSummary[fabricType].totalValue += item.stock_quantity * (item.products.unit_price || 0);
    });

    res.json(fabricSummary);
  })
};

module.exports = reportController;