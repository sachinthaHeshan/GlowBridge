// Service types based on DB structure

// Generic paginated response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface GlobalService {
  id: string;              // uuid [pk, not null]
  name: string;            // text [not null]
  description: string;     // text [not null]
}

export interface Service {
  id: string;              // uuid [pk, not null]
  salon_id: string;        // uuid [not null] - foreign key to salon.id
  is_completed: boolean;   // boolean [not null]
  name: string;            // text [not null]
  description: string;     // text [not null]
  duration: string;        // text [not null]
  price: number | null;    // int (nullable) - stored in cents
  is_public: boolean;      // boolean [not null]
  discount: number | null; // int (nullable) - percentage
}

export interface ServiceCategory {
  id: string;              // uuid [pk, not null]
  service_id: string;      // uuid [not null] - foreign key to service.id
  name: string;            // text [not null]
  description: string | null; // text (nullable)
}

export interface Package {
  id: string;              // uuid [pk, not null]
  name: string;            // text [not null]
  description: string | null; // text (nullable)
  is_public: boolean;      // boolean [not null]
}

export interface PackageService {
  id: string;              // uuid [pk, not null]
  package_id: string;      // uuid [not null] - foreign key to package.id
  service_id: string;      // uuid [not null] - foreign key to service.id
}
