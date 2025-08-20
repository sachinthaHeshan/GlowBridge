import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/services/databaseProductService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
    const salonId = searchParams.get('salon_id') || undefined;
    const inStockOnly = searchParams.get('in_stock_only') === 'true';
    const hasDiscount = searchParams.get('has_discount') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build filters object
    const filters = {
      search,
      min_price: minPrice,
      max_price: maxPrice,
      salon_id: salonId,
      in_stock_only: inStockOnly,
      has_discount: hasDiscount
    };

    // Get products using the database service
    const result = await ProductService.getProducts(filters, page, limit);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await ProductService.getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Product detail API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
