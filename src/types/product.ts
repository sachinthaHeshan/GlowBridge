export interface Product {
  id: string;                    // uuid [pk, not null]
  salon_id: string;             // uuid [not null] - foreign key to salon.id
  name: string;                 // text [not null]
  description: string | null;   // text (nullable in DB)
  price: number;                // int [not null] - stored in cents for precision
  available_quantity: number;   // int [not null]
  is_public: boolean;          // boolean [not null]
  discount: number | null;     // int (nullable in DB) - percentage
  salon_name?: string;         // joined from salon table
  image_url?: string;          // not in DB schema - will be handled separately
}

export interface Salon {
  id: string;              // uuid [pk, not null]
  name: string;           // text [not null]
  type: string;           // text [not null]
  bio: string;            // text [not null]
  location: string;       // text [not null]
  contact_number: string; // text [not null]
  created_at: Date;       // timestamp [not null]
  updated_at: Date;       // timestamp [not null]
}

export interface ProductFilters {
  salon_id?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  has_discount?: boolean;
  search?: string;
}

export interface SortOption {
  key: string;
  label: string;
  value: 'price_asc' | 'price_desc' | 'newest' | 'highest_discount';
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}
