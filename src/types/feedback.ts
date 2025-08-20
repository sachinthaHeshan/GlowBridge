// Feedback and appointment types based on DB structure

export interface ProductFeedback {
  user_id: string;         // uuid [not null] - foreign key to user.id (composite primary key)
  product_id: string;      // uuid [not null] - foreign key to product.id (composite primary key)
  comment: string;         // text [not null]
  rating: number;          // int [not null]
}

export interface ServiceFeedback {
  id: string;              // uuid [pk, not null]
  user_id: string;         // uuid [not null] - foreign key to user.id
  service_id: string;      // uuid [not null] - foreign key to service.id
  comment: string;         // text [not null]
  rating: number;          // int [not null]
}

export interface Appointment {
  id: string;              // uuid [pk, not null]
  user_id: string;         // uuid [not null] - foreign key to user.id
  note: string;            // text [not null]
  service_id: string;      // uuid [not null] - foreign key to service.id
  start_at: Date;          // timestamp [not null]
  end_at: Date;            // timestamp [not null]
  payment_type: string;    // text [not null]
  amount: number;          // double [not null]
  is_paid: boolean;        // boolean [not null]
  created_at: Date;        // timestamp [not null]
  updated_at: Date;        // timestamp [not null]
}

export interface AppointmentService {
  id: string;              // uuid [pk, not null]
  appointment_id: string;  // uuid [not null] - foreign key to appointment.id
  service_id: string;      // uuid [not null] - foreign key to service.id
}
