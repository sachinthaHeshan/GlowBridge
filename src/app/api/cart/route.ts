import { CartItem } from '@/types/cart';

// Mock user ID - Replace with actual authentication
const MOCK_USER_ID = 'user-123';

// Mock cart data - Replace with actual PostgreSQL database
let mockCartItems: CartItem[] = [
  {
    id: 'cart-1',
    user_id: MOCK_USER_ID,
    product_id: '1',
    quantity: 2,
    product: {
      id: '1',
      salon_id: 'salon-1',
      name: 'Luxury Facial Cream',
      description: 'Premium anti-aging facial cream with natural ingredients',
      price: 89.99,
      available_quantity: 15,
      discount: 20,
      salon_name: 'Bella Beauty Salon',
    },
  },
];

// Mock products for validation - Replace with actual database queries
const mockProducts = [
  {
    id: '1',
    salon_id: 'salon-1',
    name: 'Luxury Facial Cream',
    description: 'Premium anti-aging facial cream with natural ingredients',
    price: 89.99,
    available_quantity: 15,
    discount: 20,
    salon_name: 'Bella Beauty Salon',
  },
  {
    id: '2',
    salon_id: 'salon-2',
    name: 'Hair Serum Treatment',
    description: 'Nourishing hair serum for damaged and dry hair',
    price: 45.50,
    available_quantity: 0,
    discount: 0,
    salon_name: 'Glamour Studio',
  },
  {
    id: '3',
    salon_id: 'salon-1',
    name: 'Organic Lip Balm Set',
    description: 'Set of 3 organic lip balms with different flavors',
    price: 24.99,
    available_quantity: 8,
    discount: 15,
    salon_name: 'Bella Beauty Salon',
  },
];

// GET /api/cart - Fetch user's cart items with product details
export async function GET() {
  try {
    // TODO: Get user ID from authentication
    const userId = MOCK_USER_ID;

    // TODO: Replace with actual PostgreSQL query
    // SELECT ci.*, p.name, p.description, p.price, p.available_quantity, p.discount, s.name as salon_name
    // FROM shopping_cart_item ci
    // JOIN products p ON ci.product_id = p.id
    // JOIN salons s ON p.salon_id = s.id
    // WHERE ci.user_id = $1

    const userCartItems = mockCartItems.filter(item => item.user_id === userId);

    return new Response(JSON.stringify(userCartItems), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch cart' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    const { product_id, quantity = 1 } = await request.json();

    if (!product_id) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Get user ID from authentication
    const userId = MOCK_USER_ID;

    // TODO: Replace with actual PostgreSQL query to get product
    const product = mockProducts.find(p => p.id === product_id);
    
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if product is in stock
    if (product.available_quantity === 0) {
      return new Response(
        JSON.stringify({ error: 'Product is out of stock' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if item already exists in cart
    const existingItemIndex = mockCartItems.findIndex(
      item => item.user_id === userId && item.product_id === product_id
    );

    let cartItem: CartItem;

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const newQuantity = mockCartItems[existingItemIndex].quantity + quantity;
      
      // Validate quantity doesn't exceed available stock
      if (newQuantity > product.available_quantity) {
        return new Response(
          JSON.stringify({ 
            error: `Cannot add ${quantity} items. Only ${product.available_quantity - mockCartItems[existingItemIndex].quantity} more available.` 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      mockCartItems[existingItemIndex].quantity = newQuantity;
      cartItem = mockCartItems[existingItemIndex];
    } else {
      // Validate quantity doesn't exceed available stock
      if (quantity > product.available_quantity) {
        return new Response(
          JSON.stringify({ 
            error: `Cannot add ${quantity} items. Only ${product.available_quantity} available.` 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create new cart item
      cartItem = {
        id: `cart-${Date.now()}`,
        user_id: userId,
        product_id,
        quantity,
        product,
      };

      mockCartItems.push(cartItem);
    }

    // TODO: Replace with actual PostgreSQL INSERT/UPDATE
    // INSERT INTO shopping_cart_item (id, user_id, product_id, quantity)
    // VALUES ($1, $2, $3, $4)
    // ON CONFLICT (user_id, product_id)
    // DO UPDATE SET quantity = shopping_cart_item.quantity + $4

    return new Response(JSON.stringify(cartItem), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add item to cart' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE() {
  try {
    // TODO: Get user ID from authentication
    const userId = MOCK_USER_ID;

    // TODO: Replace with actual PostgreSQL query
    // DELETE FROM shopping_cart_item WHERE user_id = $1

    mockCartItems = mockCartItems.filter(item => item.user_id !== userId);

    return new Response(
      JSON.stringify({ message: 'Cart cleared successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error clearing cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to clear cart' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
