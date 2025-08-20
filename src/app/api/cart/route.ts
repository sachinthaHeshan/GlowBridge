import { NextRequest } from 'next/server';
import { CartService } from '@/services/databaseCartService';

// GET /api/cart - Get user's cart items
export async function GET(request: NextRequest) {
  try {
    // For now using a hardcoded user ID until authentication is implemented
    // Using a valid UUID format for the database
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';
    
    const cartItems = await CartService.getCartItems(userId);
    
    return new Response(JSON.stringify(cartItems), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch cart items' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { product_id, quantity = 1 } = await request.json();
    
    if (!product_id) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // For now using a hardcoded user ID until authentication is implemented
    // Using a valid UUID format for the database
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';
    
    const cartItem = await CartService.addToCart(userId, product_id, quantity);
    
    return new Response(JSON.stringify(cartItem), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    let errorMessage = 'Failed to add item to cart';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Product not found')) {
        errorMessage = 'Product not found';
        statusCode = 404;
      } else if (error.message.includes('Insufficient inventory')) {
        errorMessage = 'Insufficient inventory';
        statusCode = 400;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    // For now using a hardcoded user ID until authentication is implemented
    // Using a valid UUID format for the database
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';
    
    await CartService.clearCart(userId);
    
    return new Response(
      JSON.stringify({ message: 'Cart cleared successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error clearing cart:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to clear cart' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}