const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixSequences() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing PostgreSQL sequences...');
    
    // List of tables with auto-increment IDs that need sequence fixes
    const tables = [
      'salon',
      'product', 
      'shopping_cart_item',
      'order',
      'order_item',
      'service',
      'appointment',
      'role',
      'user_role',
      'service_category',
      'package',
      'package_service',
      'feedback',
      'salon_image',
      'product_image',
      'invoice',
      'payment',
      'notification'
    ];
    
    for (const table of tables) {
      try {
        // Check if table exists and has data
        const result = await client.query(`
          SELECT COUNT(*) as count, MAX(id) as max_id 
          FROM ${table} 
          WHERE id IS NOT NULL
        `);
        
        const count = parseInt(result.rows[0].count);
        const maxId = result.rows[0].max_id;
        
        if (count > 0 && maxId) {
          console.log(`📊 Table ${table}: ${count} rows, max ID: ${maxId}`);
          
          // Reset the sequence to the correct value
          const sequenceName = `${table}_id_seq`;
          await client.query(`
            SELECT setval('${sequenceName}', ${maxId}, true)
          `);
          
          console.log(`✅ Fixed sequence for ${table} (set to ${maxId})`);
        } else {
          console.log(`⚪ Table ${table}: empty or no ID column`);
        }
        
      } catch (error) {
        console.log(`⚠️  Table ${table}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Sequence fix complete!');
    console.log('You can now add items to cart without errors.');
    
  } catch (error) {
    console.error('❌ Error fixing sequences:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSequences();
