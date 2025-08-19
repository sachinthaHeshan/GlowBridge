// Script to analyze existing database structure
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function analyzeDatabase() {
  console.log('🔍 Analyzing your existing Neon database structure...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();

    // Get detailed table structure
    const tableQuery = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.character_maximum_length,
        c.is_nullable,
        c.column_default,
        tc.constraint_type
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position
    `;

    const result = await client.query(tableQuery);
    
    // Group by table
    const tables = {};
    result.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        length: row.character_maximum_length,
        nullable: row.is_nullable,
        default: row.column_default,
        constraint: row.constraint_type
      });
    });

    // Display structure
    console.log('📊 DATABASE STRUCTURE ANALYSIS');
    console.log('================================\n');

    Object.keys(tables).sort().forEach(tableName => {
      console.log(`🗂️  TABLE: ${tableName.toUpperCase()}`);
      console.log('─'.repeat(50));
      
      tables[tableName].forEach(col => {
        const type = col.length ? `${col.type}(${col.length})` : col.type;
        const nullable = col.nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const constraint = col.constraint ? ` [${col.constraint}]` : '';
        const defaultVal = col.default ? ` DEFAULT: ${col.default}` : '';
        
        console.log(`  ${col.column.padEnd(25)} ${type.padEnd(20)} ${nullable}${constraint}${defaultVal}`);
      });
      console.log('');
    });

    // Check for foreign keys
    console.log('🔗 FOREIGN KEY RELATIONSHIPS');
    console.log('=============================\n');
    
    const fkQuery = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `;

    const fkResult = await client.query(fkQuery);
    
    if (fkResult.rows.length > 0) {
      fkResult.rows.forEach(fk => {
        console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('  No foreign key relationships found');
    }

    // Check data counts
    console.log('\n📈 DATA OVERVIEW');
    console.log('================\n');
    
    for (const tableName of Object.keys(tables).sort()) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const count = parseInt(countResult.rows[0].count);
        console.log(`  ${tableName.padEnd(25)} ${count} records`);
      } catch (error) {
        console.log(`  ${tableName.padEnd(25)} Error counting records`);
      }
    }

    client.release();
    console.log('\n✅ Database analysis complete!');

  } catch (error) {
    console.error('❌ Error analyzing database:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeDatabase();
