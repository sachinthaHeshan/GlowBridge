import { NextRequest } from 'next/server';
import { ProductService } from '@/services/databaseProductService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const search = searchParams.get('search') || undefined;
    const id = searchParams.get('id') || undefined;
    const salonId = searchParams.get('salon_id') || undefined;
    const inStockOnly = searchParams.get('in_stock_only') === 'true';
    const hasDiscount = searchParams.get('has_discount') === 'true';

    // If searching for a specific product by ID
    if (id) {
      const product = await ProductService.getProductById(id);
      if (product) {
        return new Response(JSON.stringify({
          data: [product],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            itemsPerPage: 1,
            hasNextPage: false,
            hasPrevPage: false
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Build filters object
    const filters: any = {};
    if (search) filters.search = search;
    if (minPrice !== undefined) filters.min_price = minPrice;
    if (maxPrice !== undefined) filters.max_price = maxPrice;
    if (salonId) filters.salon_id = salonId;
    if (inStockOnly) filters.in_stock_only = true;
    if (hasDiscount) filters.has_discount = true;

    const result = await ProductService.getProducts(filters, page, limit);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch products',
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 12,
          hasNextPage: false,
          hasPrevPage: false
        }
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}