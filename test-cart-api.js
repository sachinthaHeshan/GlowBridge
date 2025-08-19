// Shopping Cart API Test Script
// Run this in the browser console to test cart functionality

const testCartAPI = async () => {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('🛒 Testing Shopping Cart API...\n');

  try {
    // Test 1: Get empty cart
    console.log('1. Testing GET /api/cart...');
    const getResponse = await fetch(`${baseUrl}/cart`);
    const cartItems = await getResponse.json();
    console.log('✅ Cart items:', cartItems);
    
    // Test 2: Add item to cart
    console.log('\n2. Testing POST /api/cart...');
    const addResponse = await fetch(`${baseUrl}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: '1', quantity: 2 })
    });
    const addedItem = await addResponse.json();
    console.log('✅ Added item:', addedItem);
    
    // Test 3: Update item quantity
    console.log('\n3. Testing PUT /api/cart/[id]...');
    const updateResponse = await fetch(`${baseUrl}/cart/cart-1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 3 })
    });
    const updatedItem = await updateResponse.json();
    console.log('✅ Updated item:', updatedItem);
    
    // Test 4: Get cart with items
    console.log('\n4. Testing GET /api/cart (with items)...');
    const getResponse2 = await fetch(`${baseUrl}/cart`);
    const cartItems2 = await getResponse2.json();
    console.log('✅ Cart with items:', cartItems2);
    
    // Test 5: Remove item
    console.log('\n5. Testing DELETE /api/cart/[id]...');
    const removeResponse = await fetch(`${baseUrl}/cart/cart-1`, {
      method: 'DELETE'
    });
    const removeResult = await removeResponse.json();
    console.log('✅ Removed item:', removeResult);
    
    // Test 6: Clear cart
    console.log('\n6. Testing DELETE /api/cart...');
    const clearResponse = await fetch(`${baseUrl}/cart`, {
      method: 'DELETE'
    });
    const clearResult = await clearResponse.json();
    console.log('✅ Cleared cart:', clearResult);
    
    console.log('\n🎉 All cart API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

// Uncomment to run tests
// testCartAPI();

console.log('Cart API test script loaded. Run testCartAPI() to execute tests.');
