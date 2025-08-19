require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetAndPopulateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Clearing all data from database...');
    
    // Clear all tables in the correct order (respecting foreign key constraints)
    const clearQueries = [
      'DELETE FROM shopping_cart_item;',
      'DELETE FROM order_item;',
      'DELETE FROM "order";',
      'DELETE FROM appointment;',
      'DELETE FROM package_service;',
      'DELETE FROM package;',
      'DELETE FROM user_role;',
      'DELETE FROM product;',
      'DELETE FROM service;',
      'DELETE FROM salon;',
      'DELETE FROM service_category;',
      'DELETE FROM role;',
      'DELETE FROM "user";'
    ];

    for (const query of clearQueries) {
      try {
        await client.query(query);
        console.log(`✅ Cleared: ${query.split(' ')[2]}`);
      } catch (error) {
        console.log(`⚠️  Could not clear ${query.split(' ')[2]}: ${error.message}`);
      }
    }

    console.log('\n📝 Populating database with essential e-commerce data...');

    // 1. Create roles
    console.log('👥 Creating roles...');
    await client.query(`
      INSERT INTO role (name) VALUES 
      ('customer'),
      ('salon_owner'),
      ('admin');
    `);

    // 2. Create users (need to fix user table schema first)
    console.log('👤 Creating users...');
    const userResult = await client.query(`
      INSERT INTO "user" (first_name, last_name, email, contact_number) VALUES 
      ('John', 'Doe', 'john.doe@example.com', '+1234567890'),
      ('Jane', 'Smith', 'jane.smith@example.com', '+0987654321'),
      ('Beauty', 'Admin', 'admin@glowbridge.com', '+1122334455')
      RETURNING id, first_name, email;
    `);
    
    const users = userResult.rows;
    console.log(`✅ Created ${users.length} users`);

    // 3. Create service categories (note: this seems to be tied to services, let's skip for now)
    console.log('🏷️  Skipping service categories (appears to be service-dependent)...');

    // 4. Create salons
    console.log('🏪 Creating salons...');
    const salonResult = await client.query(`
      INSERT INTO salon (name, type, bio, location, contact_number) VALUES 
      ('Glamour Studio', 'Premium Beauty Salon', 'Premium beauty salon with modern facilities and expert stylists', 'Downtown Plaza, Main Street', '+1111111111'),
      ('Elite Beauty Hub', 'Full Service Spa', 'Full-service beauty salon and spa offering comprehensive treatments', 'Fashion District, 2nd Avenue', '+2222222222'),
      ('Radiance Salon', 'Hair & Skin Specialist', 'Specialized salon focusing on hair and skin treatments', 'Uptown Center, Oak Street', '+3333333333')
      RETURNING id, name;
    `);
    
    const salons = salonResult.rows;
    console.log(`✅ Created ${salons.length} salons`);

    // 5. Create products
    console.log('🛍️  Creating products...');
    await client.query(`
      INSERT INTO product (salon_id, name, description, price, available_quantity, is_public, discount) VALUES 
      -- Glamour Studio Products
      ($1, 'Premium Nail Polish Set', 'Professional grade nail polish collection with 12 vibrant colors', 2999, 50, true, 0),
      ($1, 'Luxury Face Cream', 'Anti-aging face cream with natural ingredients', 4599, 30, true, 10),
      ($1, 'Hair Treatment Oil', 'Nourishing hair oil for all hair types', 1899, 75, true, 0),
      
      -- Elite Beauty Hub Products  
      ($2, 'Professional Makeup Kit', 'Complete makeup set for special occasions', 7999, 25, true, 15),
      ($2, 'Vitamin C Serum', 'Brightening serum for glowing skin', 3299, 40, true, 5),
      ($2, 'Herbal Shampoo', 'Organic shampoo for healthy hair', 1599, 60, true, 0),
      
      -- Radiance Salon Products
      ($3, 'Moisturizing Hand Cream', 'Intensive care for dry hands', 899, 100, true, 0),
      ($3, 'Eyebrow Styling Kit', 'Professional eyebrow shaping tools', 2299, 35, true, 20),
      ($3, 'Cleansing Face Mask', 'Purifying mask for deep cleansing', 1299, 80, true, 0)
    `, [salons[0].id, salons[1].id, salons[2].id]);

    const productCount = await client.query('SELECT COUNT(*) as count FROM product');
    console.log(`✅ Created ${productCount.rows[0].count} products`);

    console.log('\n🎉 Database reset and population complete!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏪 Salons: ${salons.length}`);
    console.log(`🛍️  Products: ${productCount.rows[0].count}`);
    
    console.log('\n🔑 Test User for Cart:');
    console.log(`Email: ${users[0].email}`);
    console.log(`User ID: ${users[0].id}`);
    
    // Update the hardcoded user ID in cart service
    console.log('\n⚠️  Remember to update the hardcoded user ID in your cart service!');
    console.log(`💡 Use this user ID: ${users[0].id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetAndPopulateDatabase();