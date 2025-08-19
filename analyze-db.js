const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function analyzeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Analyzing database structure...');
    
    // Check shopping_cart_item table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'shopping_cart_item'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 shopping_cart_item table structure:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check current data in shopping_cart_item
    const dataResult = await client.query(`
      SELECT COUNT(*) as count FROM shopping_cart_item
    `);
    
    console.log(`\n📊 Current records in shopping_cart_item: ${dataResult.rows[0].count}`);
    
    // If there are records, show a sample
    if (parseInt(dataResult.rows[0].count) > 0) {
      const sampleResult = await client.query(`
        SELECT * FROM shopping_cart_item LIMIT 3
      `);
      
      console.log('\n📄 Sample records:');
      sampleResult.rows.forEach((row, index) => {
        console.log(`  Record ${index + 1}:`, row);
      });
    }
    
  } catch (error) {
    console.error('❌ Error analyzing database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

analyzeDatabase();
