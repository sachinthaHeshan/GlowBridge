// User types based on DB structure

export interface User {
  id: string;              // uuid [pk, not null]
  first_name: string;      // text [not null]
  last_name: string;       // text [not null]
  email: string;           // text [not null]
  contact_number: string;  // text [not null]
}

export interface Role {
  id: string;              // uuid [pk, not null]
  name: string;            // text [not null]
}

export interface UserRole {
  id: string;              // uuid [pk, not null]
  user_id: string;         // uuid [not null] - foreign key to user.id
  role_id: string;         // uuid [not null] - foreign key to role.id
}

export interface SalonStaff {
  id: string;              // uuid [pk, not null]
  user_id: string;         // uuid [not null] - foreign key to user.id
  salon_id: string;        // uuid [not null] - foreign key to salon.id
}
