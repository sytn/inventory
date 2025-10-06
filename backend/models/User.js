const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Add validation for JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in environment variables');
  throw new Error('JWT_SECRET is required');
}

class User {
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: userData.username,
          password_hash: hashedPassword,
          role: userData.role || 'worker',
          full_name: userData.full_name
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in User.create:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in User.findByUsername:', error);
      return null;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error in User.verifyPassword:', error);
      return false;
    }
  }

  static generateToken(user) {
    try {
      return jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (error) {
      console.error('Error in User.generateToken:', error);
      throw new Error('Failed to generate token');
    }
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Error in User.verifyToken:', error);
      return null;
    }
  }
}

module.exports = User;