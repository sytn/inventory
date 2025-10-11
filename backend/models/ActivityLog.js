const { supabase } = require('../config/supabase');

class ActivityLog {
  static async create(logData) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([logData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUserId(userId, limit = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        users:user_id (username, full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async findAll(filters = {}, limit = 100) {
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        users:user_id (username, full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.start_date && filters.end_date) {
      query = query.gte('created_at', filters.start_date).lte('created_at', filters.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getRecentActivity(limit = 20) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        users:user_id (username, full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

module.exports = ActivityLog;