const { supabase } = require('../config/supabase');
const Inventory = require('./Inventory');

class Product {
  static async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    
    // Auto-create inventory record for the new product
    try {
      await Inventory.create(data.id);
      console.log(`Inventory record created for product ${data.id}`);
    } catch (inventoryError) {
      console.error('Failed to create inventory record:', inventoryError);
      // Continue anyway - the product was created successfully
    }
    
    return data;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('product_code');

    if (error) throw error;
    return data;
  }

  static async findByCode(productCode) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', productCode)
      .single();

    if (error) throw error;
    return data;
  }

  static async update(productCode, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('product_code', productCode)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(productCode) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_code', productCode);

    if (error) throw error;
    return true;
  }

  static async search(filters = {}) {
    let query = supabase.from('products').select('*');

    // Apply filters
    if (filters.cloth_type) {
      query = query.eq('cloth_type', filters.cloth_type);
    }
    if (filters.fabric_type) {
      query = query.eq('fabric_type', filters.fabric_type);
    }
    if (filters.size_set) {
      query = query.eq('size_set', filters.size_set);
    }
    if (filters.search) {
      query = query.ilike('product_code', `%${filters.search}%`);
    }

    const { data, error } = await query.order('product_code');
    if (error) throw error;
    return data;
  }
}

module.exports = Product;