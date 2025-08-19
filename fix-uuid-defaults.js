const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixUuidDefaults() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing UUID defaults...');
    
    // First, enable the uuid extension if not already enabled
    console.log('📦 Enabling uuid-ossp extension...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // List of tables that need UUID defaults
    const tables = [
      'salon',
      'product', 
      'shopping_cart_item',
      'order_table', // using order_table instead of 'order' (reserved word)
      'order_item',
      'service',
      'appointment',
      'role',
      'user_role',
      'service_category',
      'package',
      'package_service'
    ];
    
    for (const table of tables) {
      try {
        console.log(`🔄 Fixing ${table}...`);
        
        // Check if table exists
        const tableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `, [table]);
        
        if (!tableExists.rows[0].exists) {
          console.log(`⚪ Table ${table} does not exist, skipping...`);
          continue;
        }
        
        // Add UUID default to the id column
        await client.query(`
          ALTER TABLE ${table} 
          ALTER COLUMN id SET DEFAULT uuid_generate_v4()
        `);
        
        console.log(`✅ Fixed UUID default for ${table}`);
        
      } catch (error) {
        console.log(`⚠️  Table ${table}: ${error.message}`);
      }
    }
    
    // Special case for 'order' table (reserved keyword)
    try {
      console.log(`🔄 Fixing "order" table...`);
      await client.query(`
        ALTER TABLE "order" 
        ALTER COLUMN id SET DEFAULT uuid_generate_v4()
      `);
      console.log(`✅ Fixed UUID default for "order" table`);
    } catch (error) {
      console.log(`⚠️  Order table: ${error.message}`);
    }
    
    console.log('\n🎉 UUID defaults fix complete!');
    console.log('Now the database will auto-generate UUIDs for new records.');
    
  } catch (error) {
    console.error('❌ Error fixing UUID defaults:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixUuidDefaults();
