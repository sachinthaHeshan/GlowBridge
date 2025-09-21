const { db } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.contact_number = data.contact_number;
    this.role = data.role;
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await db.query(`
        SELECT id, first_name, last_name, email, contact_number, role
        FROM "user" WHERE id = $1
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

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await db.query(`
        SELECT id, first_name, last_name, email, contact_number, role
        FROM "user" WHERE email = $1
      `, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Create a new user
  static async create(userData) {
    try {
      const { first_name, last_name, email, contact_number, role = 'customer' } = userData;

      // Check if user already exists
      const existingUser = await db.query(`
        SELECT id FROM "user" WHERE email = $1
      `, [email]);

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Create user
      const result = await db.query(`
        INSERT INTO "user" (first_name, last_name, email, contact_number, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, first_name, last_name, email, contact_number, role
      `, [first_name, last_name, email, contact_number, role]);

      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get full name
  getFullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Check if user is customer
  isCustomer() {
    return this.role === 'customer';
  }
}

module.exports = User;
