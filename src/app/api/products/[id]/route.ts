import { NextRequest } from 'next/server';
import { ProductService } from '@/services/databaseProductService';

// GET /api/products/[id] - Get individual product details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const product = await ProductService.getProductById(id);
    
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch product' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
