// Real database schema types based on your Neon database
export interface User {
  id: string;              // uuid [pk]
  first_name: string;      // text [not null]
  last_name: string;       // text [not null]
  email: string;           // text [not null, unique]
  contact_number: string;  // text [not null]
}

export interface Salon {
  id: string;              // uuid [pk]
  name: string;            // text [not null]
  type: string;            // text [not null]
  bio: string;             // text [not null]
  location: string;        // text [not null]
  contact_number: string;  // text [not null]
  created_at: Date;        // timestamp [not null, default: now()]
  updated_at: Date;        // timestamp [not null, default: now()]
}

export interface Product {
  id: string;              // uuid [pk]
  salon_id: string;        // uuid [not null, fk to salon.id]
  name: string;            // text [not null]
  description: string | null; // text [nullable]
  price: number;           // integer [not null] - stored in cents
  available_quantity: number; // integer [not null]
  is_public: boolean;      // boolean [not null, default: true]
  discount: number | null; // integer [nullable, default: 0]
}

export interface ShoppingCartItem {
  id: string;              // uuid [pk]
  user_id: string;         // uuid [not null, fk to user.id]
  product_id: string;      // uuid [not null, fk to product.id]
  quantity: number;        // integer [not null]
}

export interface Order {
  id: string;              // uuid [pk]
  user_id: string;         // uuid [not null, fk to user.id]
  description: string | null; // text [nullable]
  payment_type: string;    // text [not null]
  amount: number;          // double precision [not null]
  is_paid: boolean;        // boolean [not null, default: false]
}

export interface OrderItem {
  id: string;              // uuid [pk]
  user_id: string;         // uuid [not null, fk to user.id]
  product_id: string;      // uuid [not null, fk to product.id]
  quantity: number;        // integer [not null]
}

export interface Service {
  id: string;              // uuid [pk]
  salon_id: string;        // uuid [not null, fk to salon.id]
  is_completed: boolean;   // boolean [not null, default: false]
  name: string;            // text [not null]
  description: string;     // text [not null]
  duration: string;        // text [not null]
  price: number | null;    // integer [nullable]
  is_public: boolean;      // boolean [not null]
  discount: number | null; // integer [nullable, default: 0]
}

export interface Appointment {
  id: string;              // uuid [pk]
  user_id: string;         // uuid [not null, fk to user.id]
  note: string;            // text [not null]
  service_id: string;      // uuid [not null, fk to service.id]
  start_at: Date;          // timestamp [not null]
  end_at: Date;            // timestamp [not null]
  payment_type: string;    // text [not null]
  amount: number;          // double precision [not null]
  is_paid: boolean;        // boolean [not null, default: false]
  created_at: Date;        // timestamp [not null, default: now()]
  updated_at: Date;        // timestamp [not null, default: now()]
}

export interface Role {
  id: string;              // uuid [pk]
  name: string;            // text [not null, unique]
}

export interface UserRole {
  id: string;              // uuid [pk]
  user_id: string;         // uuid [not null, fk to user.id]
  role_id: string;         // uuid [not null, fk to role.id]
}

// Extended types for frontend use
export interface ProductWithSalon extends Product {
  salon_name: string;
  salon_location: string;
}

export interface CartItemWithProduct extends ShoppingCartItem {
  product: ProductWithSalon;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  user: User;
}

// Filter types
export interface ProductFilters {
  search?: string;
  min_price?: number;
  max_price?: number;
  salon_id?: string;
  in_stock_only?: boolean;
  has_discount?: boolean;
}

export interface ServiceFilters {
  search?: string;
  salon_id?: string;
  min_price?: number;
  max_price?: number;
  has_discount?: boolean;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
