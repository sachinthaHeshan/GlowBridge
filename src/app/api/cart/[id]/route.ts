import { NextRequest } from 'next/server';
import { CartService } from '@/services/databaseCartService';

// PUT /api/cart/[id] - Update item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { quantity } = await request.json();
    const { id } = params;

    if (!quantity || quantity < 1) {
      return new Response(
        JSON.stringify({ error: 'Quantity must be at least 1' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // For now using a hardcoded user ID until authentication is implemented
    // Using a valid UUID format for the database
    const userId = '00000000-0000-0000-0000-000000000123';

    const updatedItem = await CartService.updateCartItemQuantity(userId, id, quantity);
    
    if (!updatedItem) {
      return new Response(
        JSON.stringify({ error: 'Cart item not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(updatedItem), {
      status: 200,
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // For now using a hardcoded user ID until authentication is implemented
    // Using a valid UUID format for the database
    const userId = '00000000-0000-0000-0000-000000000123';

    const success = await CartService.removeFromCart(userId, id);
    
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Cart item not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Item removed from cart successfully' }),
      {
        status: 200,
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
