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

// Mock products for validation
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
];

// PUT /api/cart/[id] - Update item quantity
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { quantity } = await request.json();
    const itemId = params.id;

    if (!quantity || quantity < 1) {
      return new Response(
        JSON.stringify({ error: 'Quantity must be at least 1' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Get user ID from authentication
    const userId = MOCK_USER_ID;

    // Find cart item
    const cartItemIndex = mockCartItems.findIndex(
      item => item.id === itemId && item.user_id === userId
    );

    if (cartItemIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'Cart item not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const cartItem = mockCartItems[cartItemIndex];
    
    // Get product to validate quantity
    const product = mockProducts.find(p => p.id === cartItem.product_id);
    
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate quantity doesn't exceed available stock
    if (quantity > product.available_quantity) {
      return new Response(
        JSON.stringify({ 
          error: `Cannot set quantity to ${quantity}. Only ${product.available_quantity} available.` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update quantity
    mockCartItems[cartItemIndex].quantity = quantity;

    // TODO: Replace with actual PostgreSQL UPDATE
    // UPDATE shopping_cart_item SET quantity = $1 WHERE id = $2 AND user_id = $3

    return new Response(JSON.stringify(mockCartItems[cartItemIndex]), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update cart item' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

    // TODO: Get user ID from authentication
    const userId = MOCK_USER_ID;

    // Find and remove cart item
    const initialLength = mockCartItems.length;
    mockCartItems = mockCartItems.filter(
      item => !(item.id === itemId && item.user_id === userId)
    );

    if (mockCartItems.length === initialLength) {
      return new Response(
        JSON.stringify({ error: 'Cart item not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Replace with actual PostgreSQL DELETE
    // DELETE FROM shopping_cart_item WHERE id = $1 AND user_id = $2

    return new Response(
      JSON.stringify({ message: 'Item removed from cart successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error removing cart item:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to remove cart item' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
