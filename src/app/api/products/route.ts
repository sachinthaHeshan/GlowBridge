import { Product } from '@/types/product';

// Mock database - Replace with actual PostgreSQL queries
const mockProducts: Product[] = [
  {
    id: '1',
    salon_id: 'salon-1',
    name: 'Luxury Facial Cream',
    description: 'Premium anti-aging facial cream with natural ingredients',
    price: 89.99,
    available_quantity: 15,
    is_public: true,
    discount: 20,
    salon_name: 'Bella Beauty Salon',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    salon_id: 'salon-2',
    name: 'Hair Serum Treatment',
    description: 'Nourishing hair serum for damaged and dry hair',
    price: 45.50,
    available_quantity: 0,
    is_public: true,
    discount: 0,
    salon_name: 'Glamour Studio',
    created_at: '2024-01-10',
  },
  {
    id: '3',
    salon_id: 'salon-1',
    name: 'Organic Lip Balm Set',
    description: 'Set of 3 organic lip balms with different flavors',
    price: 24.99,
    available_quantity: 8,
    is_public: true,
    discount: 15,
    salon_name: 'Bella Beauty Salon',
    created_at: '2024-01-20',
  },
  {
    id: '4',
    salon_id: 'salon-3',
    name: 'Professional Makeup Kit',
    description: 'Complete makeup kit for professional use',
    price: 199.99,
    available_quantity: 3,
    is_public: true,
    discount: 30,
    salon_name: 'Elite Beauty Center',
    created_at: '2024-01-18',
  },
  {
    id: '5',
    salon_id: 'salon-2',
    name: 'Moisturizing Body Lotion',
    description: 'Deep moisturizing body lotion for all skin types',
    price: 32.75,
    available_quantity: 12,
    is_public: true,
    discount: 0,
    salon_name: 'Glamour Studio',
    created_at: '2024-01-12',
  },
  {
    id: '6',
    salon_id: 'salon-3',
    name: 'Eye Shadow Palette',
    description: '24-color professional eye shadow palette',
    price: 67.99,
    available_quantity: 6,
    is_public: true,
    discount: 25,
    salon_name: 'Elite Beauty Center',
    created_at: '2024-01-22',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'newest';
    const salon_id = searchParams.get('salon_id');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const in_stock_only = searchParams.get('in_stock_only') === 'true';
    const has_discount = searchParams.get('has_discount') === 'true';
    const search = searchParams.get('search');

    // Filter products
    let filteredProducts = mockProducts.filter(product => {
      if (salon_id && product.salon_id !== salon_id) return false;
      if (min_price && product.price < parseFloat(min_price)) return false;
      if (max_price && product.price > parseFloat(max_price)) return false;
      if (in_stock_only && product.available_quantity <= 0) return false;
      if (has_discount && product.discount <= 0) return false;
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
      return product.is_public;
    });

    // Sort products
    filteredProducts.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'highest_discount':
          return b.discount - a.discount;
        case 'newest':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response = {
      products: paginatedProducts,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(filteredProducts.length / limit),
        total_items: filteredProducts.length,
        items_per_page: limit,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
