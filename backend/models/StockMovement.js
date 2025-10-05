const { supabase } = require('../config/supabase');

class StockMovement {
  static async create(movementData) {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([movementData])
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

  static async findByProductId(productId) {
    const { data, error } = await supabase
      .from('stock_movements')
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
      .eq('product_id', productId)
      .order('movement_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('stock_movements')
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
      .order('movement_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getMovementsByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('stock_movements')
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
      .gte('movement_date', startDate)
      .lte('movement_date', endDate)
      .order('movement_date', { ascending: false });

    if (error) throw error;
    return data;
  }
}

module.exports = StockMovement;