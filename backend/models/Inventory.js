const { supabase } = require('../config/supabase');

class Inventory {
  static async create(productId) {
    const { data, error } = await supabase
      .from('inventory')
      .insert([{ product_id: productId }])
      .select(`
        *,
        products (
          product_code,
          cloth_type,
          fabric_type,
          color,
          size_set
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          product_code,
          cloth_type,
          fabric_type,
          color,
          size_set
        )
      `);

    if (error) throw error;
    return data;
  }

  static async findByProductId(productId) {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          product_code,
          cloth_type,
          fabric_type,
          color,
          size_set
        )
      `)
      .eq('product_id', productId);

    if (error) throw error;
    return data[0] || null;
  }

  static async updateStock(productId, newQuantity) {
    if (newQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .select(`
        *,
        products (
          product_code,
          cloth_type,
          fabric_type,
          color,
          size_set
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async getLowStock() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          product_code,
          cloth_type,
          fabric_type,
          color,
          size_set
        )
      `);

    if (error) throw error;
    
    // Filter in JavaScript for low stock items
    return data.filter(item => item.stock_quantity <= item.low_stock_threshold);
  }
}

module.exports = Inventory;