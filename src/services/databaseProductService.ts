import { db, PoolClient } from '@/lib/database';
import { Product, ProductWithSalon, ProductFilters, PaginatedResponse } from '@/types/database';

export class ProductService {
  // Get all products with optional filtering and pagination
  static async getProducts(
    filters?: ProductFilters, 
    page = 1, 
    limit = 12
  ): Promise<PaginatedResponse<ProductWithSalon>> {
    let query = `
      SELECT 
        p.id,
        p.salon_id,
        p.name,
        p.description,
        p.price,
        p.available_quantity,
        p.is_public,
        p.discount,
        s.name as salon_name,
        s.location as salon_location
      FROM product p
      JOIN salon s ON p.salon_id = s.id
      WHERE p.is_public = true
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (filters?.search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters?.min_price !== undefined) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(Math.round(filters.min_price * 100)); // Convert to cents
      paramIndex++;
    }

    if (filters?.max_price !== undefined) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(Math.round(filters.max_price * 100)); // Convert to cents
      paramIndex++;
    }

    if (filters?.salon_id) {
      query += ` AND p.salon_id = $${paramIndex}`;
      params.push(filters.salon_id);
      paramIndex++;
    }

    if (filters?.in_stock_only) {
      query += ` AND p.available_quantity > 0`;
    }

    if (filters?.has_discount) {
      query += ` AND p.discount IS NOT NULL AND p.discount > 0`;
    }

    // Add sorting
    query += ` ORDER BY p.name ASC`;

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM product p
      JOIN salon s ON p.salon_id = s.id
      WHERE p.is_public = true
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;

    // Apply the same filters for count query
    if (filters?.search) {
      countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex})`;
      countParams.push(`%${filters.search}%`);
      countParamIndex++;
    }

    if (filters?.min_price !== undefined) {
      countQuery += ` AND p.price >= $${countParamIndex}`;
      countParams.push(Math.round(filters.min_price * 100));
      countParamIndex++;
    }

    if (filters?.max_price !== undefined) {
      countQuery += ` AND p.price <= $${countParamIndex}`;
      countParams.push(Math.round(filters.max_price * 100));
      countParamIndex++;
    }

    if (filters?.salon_id) {
      countQuery += ` AND p.salon_id = $${countParamIndex}`;
      countParams.push(filters.salon_id);
      countParamIndex++;
    }

    if (filters?.in_stock_only) {
      countQuery += ` AND p.available_quantity > 0`;
    }

    if (filters?.has_discount) {
      countQuery += ` AND p.discount IS NOT NULL AND p.discount > 0`;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].total);

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    try {
      const result = await db.query(query, params);
      
      const products: ProductWithSalon[] = result.rows.map(row => ({
        id: row.id,
        salon_id: row.salon_id,
        name: row.name,
        description: row.description,
        price: row.price, // Already in cents from database
        available_quantity: row.available_quantity,
        is_public: row.is_public,
        discount: row.discount,
        salon_name: row.salon_name,
        salon_location: row.salon_location
      }));

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: products,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get product by ID
  static async getProductById(id: string): Promise<ProductWithSalon | null> {
    try {
      const result = await db.query(`
        SELECT 
          p.id,
          p.salon_id,
          p.name,
          p.description,
          p.price,
          p.available_quantity,
          p.is_public,
          p.discount,
          s.name as salon_name,
          s.location as salon_location
        FROM product p
        JOIN salon s ON p.salon_id = s.id
        WHERE p.id = $1 AND p.is_public = true
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        salon_id: row.salon_id,
        name: row.name,
        description: row.description,
        price: row.price, // Already in cents from database
        available_quantity: row.available_quantity,
        is_public: row.is_public,
        discount: row.discount,
        salon_name: row.salon_name,
        salon_location: row.salon_location
      };
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Update product inventory
  static async updateInventory(productId: string, quantityChange: number): Promise<boolean> {
    try {
      const result = await db.query(`
        UPDATE product 
        SET available_quantity = available_quantity + $2
        WHERE id = $1 AND available_quantity + $2 >= 0
        RETURNING available_quantity
      `, [productId, quantityChange]);

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw new Error('Failed to update inventory');
    }
  }

  // Check if product has sufficient quantity
  static async checkInventory(productId: string, requestedQuantity: number): Promise<boolean> {
    try {
      const result = await db.query(`
        SELECT available_quantity 
        FROM product 
        WHERE id = $1
      `, [productId]);

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].available_quantity >= requestedQuantity;
    } catch (error) {
      console.error('Error checking inventory:', error);
      throw new Error('Failed to check inventory');
    }
  }

  // Get products by salon
  static async getProductsBySalon(salonId: string, page = 1, limit = 12): Promise<PaginatedResponse<ProductWithSalon>> {
    return this.getProducts({ salon_id: salonId }, page, limit);
  }

  // Search products
  static async searchProducts(searchTerm: string, page = 1, limit = 12): Promise<PaginatedResponse<ProductWithSalon>> {
    return this.getProducts({ search: searchTerm }, page, limit);
  }
}

export default ProductService;
