const { Pool } = require('pg');

// DB Connection
class Database {
  constructor() {
    this.pool = null;
    this.connect();
  }

  connect() {
    if (!this.pool) {
      // Use DATABASE_URL if available, otherwise use individual parameters
      if (process.env.DATABASE_URL) {
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes('sslmode=require') || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
      } else {
        this.pool = new Pool({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
      }

      // Handle pool errors
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
      });

      // Handle pool connection
      this.pool.on('connect', () => {
        console.log('Connected to PostgreSQL database');
      });
    }
  }

  // Get a client from the pool
  async getClient() {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.connect();
  }

  // Execute a query
  async query(text, params = []) {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Transaction wrapper
  async transaction(callback) {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Close the pool
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  // Test DB connection
  async testConnection() {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      console.log('Database connection test successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const db = new Database();

// Helper function to initialize database tables (check that the database is initialized correctly)
async function initializeDatabase() {
  try {
    // Test connection first
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Helper function to check if database is ready (in here system check DB is ready to use)
async function isDatabaseReady() {
  try {
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  db,
  initializeDatabase,
  isDatabaseReady
};
