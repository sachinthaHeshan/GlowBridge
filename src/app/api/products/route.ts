import { Product } from '@/types/product';

// TODO: Replace with actual PostgreSQL connection
// Example query for fetching products:
/*
SELECT 
  p.id,
  p.salon_id,
  p.name,
  p.description,
  p.price,
  p.available_quantity,
  p.is_public,
  p.discount,
  s.name as salon_name
FROM product p
LEFT JOIN salon s ON p.salon_id = s.id
WHERE p.is_public = true
  AND ($1::uuid IS NULL OR p.salon_id = $1)
  AND ($2::integer IS NULL OR p.price >= $2)
  AND ($3::integer IS NULL OR p.price <= $3)
  AND ($4::boolean IS NULL OR p.available_quantity > 0)
  AND ($5::boolean IS NULL OR p.discount > 0)
  AND ($6::text IS NULL OR p.name ILIKE '%' || $6 || '%')
ORDER BY 
  CASE WHEN $7 = 'price_asc' THEN p.price END ASC,
  CASE WHEN $7 = 'price_desc' THEN p.price END DESC,
  CASE WHEN $7 = 'highest_discount' THEN COALESCE(p.discount, 0) END DESC,
  p.id DESC
LIMIT $8 OFFSET $9;
*/

// Mock database - Replace with actual PostgreSQL queries
const mockProducts: Product[] = [
  {
    id: '1',
    salon_id: 'salon-1',
    name: 'Luxury Facial Cream',
    description: 'Premium anti-aging facial cream with natural ingredients',
    price: 8999,  // $89.99 stored as cents (8999 cents)
    available_quantity: 15,
    is_public: true,
    discount: 20,  // 20% discount
    salon_name: 'Bella Beauty Salon',
  },
  {
    id: '2',
    salon_id: 'salon-2',
    name: 'Hair Serum Treatment',
    description: 'Nourishing hair serum for damaged and dry hair',
    price: 4550,  // $45.50 stored as cents (4550 cents)
    available_quantity: 0,
    is_public: true,
    discount: null,  // no discount
    salon_name: 'Glamour Studio',
  },
  {
    id: '3',
    salon_id: 'salon-1',
    name: 'Organic Lip Balm Set',
    description: 'Set of 3 organic lip balms with different flavors',
    price: 2499,  // $24.99 stored as cents (2499 cents)
    available_quantity: 8,
    is_public: true,
    discount: 15,  // 15% discount
    salon_name: 'Bella Beauty Salon',
  },
  {
    id: '4',
    salon_id: 'salon-3',
    name: 'Professional Makeup Kit',
    description: 'Complete makeup kit for professional use',
    price: 19999, // $199.99 stored as cents (19999 cents)
    available_quantity: 3,
    is_public: true,
    discount: 30,  // 30% discount
    salon_name: 'Elite Beauty Center',
  },
  {
    id: '5',
    salon_id: 'salon-2',
    name: 'Moisturizing Body Lotion',
    description: 'Deep moisturizing body lotion for all skin types',
    price: 3275,  // $32.75 stored as cents (3275 cents)
    available_quantity: 12,
    is_public: true,
    discount: null,  // no discount
    salon_name: 'Glamour Studio',
  },
  {
    id: '6',
    salon_id: 'salon-3',
    name: 'Eye Shadow Palette',
    description: '24-color professional eye shadow palette',
    price: 6799,  // $67.99 stored as cents (6799 cents)
    available_quantity: 6,
    is_public: true,
    discount: 25,  // 25% discount
    salon_name: 'Elite Beauty Center',
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
      if (min_price && product.price < parseFloat(min_price) * 100) return false; // Convert to cents
      if (max_price && product.price > parseFloat(max_price) * 100) return false; // Convert to cents
      if (in_stock_only && product.available_quantity <= 0) return false;
      if (has_discount && (!product.discount || product.discount <= 0)) return false;
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
          const aDiscount = a.discount || 0;
          const bDiscount = b.discount || 0;
          return bDiscount - aDiscount;
        case 'newest':
        default:
          // Since we don't have created_at in DB schema, sort by id
          return b.id.localeCompare(a.id);
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
