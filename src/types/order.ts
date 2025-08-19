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

// Checkout system types
export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingDetails {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  total: number;
}

export interface OrderItemWithProduct {
  id?: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  salon?: string;
}

export interface CheckoutOrder {
  id?: string;
  items: OrderItemWithProduct[];
  customerDetails: CustomerDetails;
  shippingDetails: ShippingDetails;
  orderSummary: OrderSummary;
  status?: string;
  orderDate?: Date;
  paymentStatus?: string;
}

export interface PaymentRequest {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_country?: string;
  custom_1?: string;
  custom_2?: string;
}
