require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixUserTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing user table UUID default...');
    
    await client.query('ALTER TABLE "user" ALTER COLUMN id SET DEFAULT uuid_generate_v4();');
    console.log('✅ Fixed user table UUID default');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixUserTable();
