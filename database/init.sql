-- GlowBridge Database Schema
-- Based on the provided DB Structure
-- This file creates all tables with proper relationships and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create salon table
CREATE TABLE salon (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  bio TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create global_service table
CREATE TABLE global_service (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Create service table
CREATE TABLE service (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salon(id),
  is_completed BOOLEAN NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  price INTEGER, -- stored in cents for precision
  is_public BOOLEAN NOT NULL,
  discount INTEGER -- percentage discount
);

-- Create serviceCategory table
CREATE TABLE "serviceCategory" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES service(id),
  name TEXT NOT NULL,
  description TEXT
);

-- Create package table
CREATE TABLE package (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL
);

-- Create package_service table
CREATE TABLE package_service (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES package(id),
  service_id UUID NOT NULL REFERENCES service(id)
);

-- Create user table
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  contact_number TEXT NOT NULL
);

-- Create role table
CREATE TABLE role (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Create user_role table
CREATE TABLE user_role (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  role_id UUID NOT NULL REFERENCES role(id),
  UNIQUE(user_id, role_id)
);

-- Create product table
CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salon(id),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- stored in cents for precision
  available_quantity INTEGER NOT NULL,
  is_public BOOLEAN NOT NULL,
  discount INTEGER -- percentage discount
);

-- Create shopping_cart_item table
CREATE TABLE shopping_cart_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  product_id UUID NOT NULL REFERENCES product(id),
  quantity INTEGER NOT NULL,
  UNIQUE(user_id, product_id) -- prevent duplicate items for same user
);

-- Create order table
CREATE TABLE "order" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  description TEXT,
  payment_type TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  is_paid BOOLEAN NOT NULL
);

-- Create order_item table
CREATE TABLE order_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  product_id UUID NOT NULL REFERENCES product(id),
  quantity INTEGER NOT NULL
);

-- Create salon_staff table
CREATE TABLE salon_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  salon_id UUID NOT NULL REFERENCES salon(id),
  UNIQUE(user_id, salon_id)
);

-- Create product_feedback table
CREATE TABLE product_feedback (
  user_id UUID NOT NULL REFERENCES "user"(id),
  product_id UUID NOT NULL REFERENCES product(id),
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  PRIMARY KEY (user_id, product_id)
);

-- Create service_feedback table
CREATE TABLE service_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  service_id UUID NOT NULL REFERENCES service(id),
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)
);

-- Create appointment table
CREATE TABLE appointment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  note TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES service(id),
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  payment_type TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  is_paid BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create appointment_service table
CREATE TABLE appointment_service (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointment(id),
  service_id UUID NOT NULL REFERENCES service(id)
);

-- Create indexes for better performance
CREATE INDEX idx_product_salon_id ON product(salon_id);
CREATE INDEX idx_product_is_public ON product(is_public);
CREATE INDEX idx_shopping_cart_user_id ON shopping_cart_item(user_id);
CREATE INDEX idx_order_user_id ON "order"(user_id);
CREATE INDEX idx_appointment_user_id ON appointment(user_id);
CREATE INDEX idx_appointment_service_id ON appointment(service_id);
CREATE INDEX idx_service_salon_id ON service(salon_id);

-- Insert some sample data for testing
INSERT INTO salon (id, name, type, bio, location, contact_number) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Bella Beauty Salon', 'Full Service', 'Premium beauty services in the heart of the city', '123 Beauty Street, City Center', '+1-555-0101'),
('550e8400-e29b-41d4-a716-446655440002', 'Glamour Studio', 'Hair Specialist', 'Expert hair styling and treatments', '456 Style Avenue, Downtown', '+1-555-0102'),
('550e8400-e29b-41d4-a716-446655440003', 'Elite Beauty Center', 'Luxury Spa', 'Luxury beauty treatments and spa services', '789 Luxury Lane, Uptown', '+1-555-0103');

INSERT INTO product (id, salon_id, name, description, price, available_quantity, is_public, discount) VALUES
('1', '550e8400-e29b-41d4-a716-446655440001', 'Luxury Facial Cream', 'Premium anti-aging facial cream with natural ingredients', 8999, 15, true, 20),
('2', '550e8400-e29b-41d4-a716-446655440002', 'Hair Serum Treatment', 'Nourishing hair serum for damaged and dry hair', 4550, 0, true, null),
('3', '550e8400-e29b-41d4-a716-446655440001', 'Organic Lip Balm Set', 'Set of 3 organic lip balms with different flavors', 2499, 8, true, 15),
('4', '550e8400-e29b-41d4-a716-446655440003', 'Professional Makeup Kit', 'Complete makeup kit for professional use', 19999, 3, true, 30),
('5', '550e8400-e29b-41d4-a716-446655440002', 'Moisturizing Body Lotion', 'Deep moisturizing body lotion for all skin types', 3275, 12, true, null),
('6', '550e8400-e29b-41d4-a716-446655440003', 'Eye Shadow Palette', '24-color professional eye shadow palette', 6799, 6, true, 25);

-- Sample user for testing
INSERT INTO "user" (id, first_name, last_name, email, contact_number) VALUES
('user-123', 'John', 'Doe', 'john.doe@example.com', '+1-555-0199');

-- Sample roles
INSERT INTO role (id, name) VALUES
('role-1', 'customer'),
('role-2', 'salon_owner'),
('role-3', 'admin');

-- Assign customer role to sample user
INSERT INTO user_role (user_id, role_id) VALUES
('user-123', 'role-1');
