import { Product, Salon, ProductFilters, ProductsResponse } from '@/types/product';

// Mock API service - Replace with actual PostgreSQL API calls
export class ProductService {
  private static baseUrl = '/api';

  static async getProducts(
    filters: ProductFilters = {},
    sort: string = 'newest',
    page: number = 1,
    limit: number = 12
  ): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await fetch(`${this.baseUrl}/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return mock data for development
      return this.getMockProducts(filters, sort, page, limit);
    }
  }

  static async getSalons(): Promise<Salon[]> {
    try {
      const response = await fetch(`${this.baseUrl}/salons`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch salons');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching salons:', error);
      // Return mock data for development
      return this.getMockSalons();
    }
  }

  // Mock data for development - Remove when connecting to real API
  private static getMockProducts(
    filters: ProductFilters,
    sort: string,
    page: number,
    limit: number
  ): ProductsResponse {
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

    // Apply filters
    let filteredProducts = mockProducts.filter(product => {
      if (filters.salon_id && product.salon_id !== filters.salon_id) return false;
      if (filters.min_price && product.price < filters.min_price) return false;
      if (filters.max_price && product.price > filters.max_price) return false;
      if (filters.in_stock_only && product.available_quantity <= 0) return false;
      if (filters.has_discount && product.discount <= 0) return false;
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    // Apply sorting
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

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(filteredProducts.length / limit),
        total_items: filteredProducts.length,
        items_per_page: limit,
      },
    };
  }

  private static getMockSalons(): Salon[] {
    return [
      { id: 'salon-1', name: 'Bella Beauty Salon' },
      { id: 'salon-2', name: 'Glamour Studio' },
      { id: 'salon-3', name: 'Elite Beauty Center' },
    ];
  }
}
