const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.full_name = data.full_name;
    this.phone = data.phone;
    this.address = data.address;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Don't include password in the model
  }

  // Create a new user
  static async create(userData) {
    try {
      const { username, email, password, full_name, phone, address } = userData;

      // Check if user already exists
      const existingUser = await db.query(`
        SELECT id FROM users WHERE username = $1 OR email = $2
      `, [username, email]);

      if (existingUser.rows.length > 0) {
        throw new Error('User with this username or email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await db.query(`
        INSERT INTO users (username, email, password, full_name, phone, address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, email, full_name, phone, address, created_at, updated_at
      `, [username, email, hashedPassword, full_name, phone, address]);

      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await db.query(`
        SELECT id, username, email, password, full_name, phone, address, created_at, updated_at
        FROM users WHERE email = $1
      `, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0]; // Return raw data including password for authentication
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const result = await db.query(`
        SELECT id, username, email, password, full_name, phone, address, created_at, updated_at
        FROM users WHERE username = $1
      `, [username]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0]; // Return raw data including password for authentication
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Find user by ID (excluding password)
  static async findById(id) {
    try {
      const result = await db.query(`
        SELECT id, username, email, full_name, phone, address, created_at, updated_at
        FROM users WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    try {
      const { full_name, phone, address } = updateData;
      
      const result = await db.query(`
        UPDATE users 
        SET full_name = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, username, email, full_name, phone, address, created_at, updated_at
      `, [id, full_name, phone, address]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const result = await db.query(`
        UPDATE users 
        SET password = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `, [id, hashedPassword]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
}

module.exports = User;
