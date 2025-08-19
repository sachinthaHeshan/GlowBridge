export interface Product {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  is_public: boolean;
  discount: number;
  salon_name?: string;
  image_url?: string;
  created_at?: string;
}

export interface Salon {
  id: string;
  name: string;
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
