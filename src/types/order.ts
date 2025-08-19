// Order types based on DB structure

export interface Order {
  id: string;              // uuid [pk, not null]
  user_id: string;         // uuid [not null] - foreign key to user.id
  description: string | null; // text (nullable)
  payment_type: string;    // text [not null]
  amount: number;          // double [not null] - final amount
  is_paid: boolean;        // boolean [not null]
}

export interface OrderItem {
  id: string;              // uuid [pk, not null]
  user_id: string;         // uuid [not null] - foreign key to user.id
  product_id: string;      // uuid [not null] - foreign key to product.id
  quantity: number;        // int [not null]
}
