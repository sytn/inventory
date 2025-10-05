const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const { supabase } = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

const exportController = {
  // Export inventory to CSV
  exportInventoryCSV: asyncHandler(async (req, res) => {
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

    // Transform data for CSV
    const csvData = inventory.map(item => ({
      Product_Code: item.products.product_code,
      Cloth_Type: item.products.cloth_type,
      Fabric_Type: item.products.fabric_type,
      Color: item.products.color,
      Size_Set: item.products.size_set,
      Stock_Quantity: item.stock_quantity,
      Low_Stock_Threshold: item.low_stock_threshold,
      Unit_Price: item.products.unit_price || 0,
      Status: item.stock_quantity <= item.low_stock_threshold ? 
        (item.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock',
      Total_Value: (item.stock_quantity * (item.products.unit_price || 0)).toFixed(2)
    }));

    const fields = [
      'Product_Code',
      'Cloth_Type', 
      'Fabric_Type',
      'Color',
      'Size_Set',
      'Stock_Quantity',
      'Low_Stock_Threshold',
      'Unit_Price',
      'Status',
      'Total_Value'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('inventory-report.csv');
    res.send(csv);
  }),

  // Export inventory to Excel
  exportInventoryExcel: asyncHandler(async (req, res) => {
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');

    // Add headers
    worksheet.columns = [
      { header: 'Product Code', key: 'product_code', width: 15 },
      { header: 'Cloth Type', key: 'cloth_type', width: 12 },
      { header: 'Fabric Type', key: 'fabric_type', width: 12 },
      { header: 'Color', key: 'color', width: 15 },
      { header: 'Size Set', key: 'size_set', width: 12 },
      { header: 'Stock Quantity', key: 'stock_quantity', width: 15 },
      { header: 'Low Stock Threshold', key: 'low_stock_threshold', width: 20 },
      { header: 'Unit Price', key: 'unit_price', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Total Value', key: 'total_value', width: 15 }
    ];

    // Add data rows
    inventory.forEach(item => {
      const totalValue = item.stock_quantity * (item.products.unit_price || 0);
      const status = item.stock_quantity <= item.low_stock_threshold ? 
        (item.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock';

      worksheet.addRow({
        product_code: item.products.product_code,
        cloth_type: item.products.cloth_type,
        fabric_type: item.products.fabric_type,
        color: item.products.color,
        size_set: item.products.size_set,
        stock_quantity: item.stock_quantity,
        low_stock_threshold: item.low_stock_threshold,
        unit_price: item.products.unit_price || 0,
        status: status,
        total_value: totalValue
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  }),

  // Export stock movements to CSV
  exportMovementsCSV: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
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

    if (startDate) query = query.gte('movement_date', startDate);
    if (endDate) query = query.lte('movement_date', endDate);

    const { data: movements, error } = await query;
    if (error) throw error;

    const csvData = movements.map(movement => ({
      Date: new Date(movement.movement_date).toLocaleDateString(),
      Product_Code: movement.products.product_code,
      Cloth_Type: movement.products.cloth_type,
      Fabric_Type: movement.products.fabric_type,
      Movement_Type: movement.movement_type,
      Quantity: movement.quantity,
      Reason: movement.reason,
      Created_By: movement.created_by,
      Notes: movement.notes || ''
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('stock-movements.csv');
    res.send(csv);
  }),

  // Export low stock report to CSV
  exportLowStockCSV: asyncHandler(async (req, res) => {
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

    const lowStock = inventory.filter(item => item.stock_quantity <= item.low_stock_threshold);

    const csvData = lowStock.map(item => ({
      Product_Code: item.products.product_code,
      Cloth_Type: item.products.cloth_type,
      Fabric_Type: item.products.fabric_type,
      Color: item.products.color,
      Size_Set: item.products.size_set,
      Current_Stock: item.stock_quantity,
      Low_Stock_Threshold: item.low_stock_threshold,
      Unit_Price: item.products.unit_price || 0,
      Status: item.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock',
      Urgency: item.stock_quantity === 0 ? 'CRITICAL' : 'HIGH'
    }));

    const fields = [
      'Product_Code', 'Cloth_Type', 'Fabric_Type', 'Color', 'Size_Set',
      'Current_Stock', 'Low_Stock_Threshold', 'Unit_Price', 'Status', 'Urgency'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('low-stock-alert.csv');
    res.send(csv);
  })
};

module.exports = exportController;