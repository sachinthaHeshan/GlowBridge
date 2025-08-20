import { Product, ProductsResponse, ProductFilters } from '@/types/product';

export class ProductService {
  private static readonly baseUrl = '/api/products';

  static async getProducts(
    filters?: ProductFilters,
    sortBy?: string,
    page?: number,
    limit?: number
  ): Promise<ProductsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (page) searchParams.append('page', page.toString());
      if (limit) searchParams.append('limit', limit.toString());
      if (filters?.search) searchParams.append('search', filters.search);
      if (filters?.min_price !== undefined) searchParams.append('minPrice', filters.min_price.toString());
      if (filters?.max_price !== undefined) searchParams.append('maxPrice', filters.max_price.toString());
      if (filters?.salon_id) searchParams.append('salon_id', filters.salon_id);
      if (filters?.in_stock_only) searchParams.append('in_stock_only', 'true');
      if (filters?.has_discount) searchParams.append('has_discount', 'true');
      if (sortBy) searchParams.append('sort', sortBy);

      const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // Transform the API response to match expected format
      return {
        products: apiResponse.data || [],
        pagination: {
          current_page: apiResponse.pagination?.currentPage || 1,
          total_pages: apiResponse.pagination?.totalPages || 0,
          total_items: apiResponse.pagination?.totalItems || 0,
          items_per_page: apiResponse.pagination?.itemsPerPage || limit || 12
        }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty response when database is empty or there's an error
      return {
        products: [],
        pagination: {
          current_page: page || 1,
          total_pages: 0,
          total_items: 0,
          items_per_page: limit || 12
        }
      };
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await this.getProducts({ salon_id: category }); // Using salon_id as category
      return response.products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.getProducts({ search: query });
      return response.products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  static async getSalons(): Promise<any[]> {
    try {
      const response = await fetch('/api/salons');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch salons: ${response.status}`);
      }
      
      const data = await response.json();
      return data.salons || [];
    } catch (error) {
      console.error('Error fetching salons:', error);
      return [];
    }
  }
}