# GlowBridge Backend

## Running locally

1. Set `DATABASE_URL` in your environment.
2. Optional: set `PGSSL=true` if using a managed DB that requires SSL.
3. Start in dev mode:

```bash
npm run dev
```

Server listens on `http://localhost:3005` by default.

## API Base URL

All endpoints are prefixed with:

```
http://localhost:3005/api
```

## Conventions

- Request/response bodies are JSON.
- Use header: `Content-Type: application/json` for POST/PUT.
- Validation errors return HTTP 400 with shape:

```json
{
  "error": "ValidationError",
  "message": "Invalid request body",
  "fieldErrors": { "field": ["message"] },
  "formErrors": []
}
```

- Unique constraint conflict (e.g., duplicate email) returns HTTP 409:

```json
{ "error": "Conflict", "message": "Email already exists" }
```

---

## Users

Table: `public.user`

Fields:

- `id: uuid`
- `first_name: text`
- `last_name: text`
- `email: text` (unique)
- `contact_number: text`
- `role: text` (defaults to `customer`)

Allowed roles: `customer`, `admin`, `salon_owner`, `salon_staff`.

### Create user

- Method: POST
- Path: `/users`
- Body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "contact_number": "+1234567890",
  "role": "customer"
}
```

- Response: 201

```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "contact_number": "+1234567890",
    "role": "customer"
  }
}
```

- cURL

```bash
curl -X POST http://localhost:3005/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "contact_number": "+1234567890",
    "role": "customer"
  }'
```

### List users

- Method: GET
- Path: `/users`
- Response: 200

```json
{
  "users": [
    {
      "id": "uuid",
      "first_name": "...",
      "last_name": "...",
      "email": "...",
      "contact_number": "...",
      "role": "..."
    }
  ]
}
```

- cURL

```bash
curl http://localhost:3005/api/users
```

### Get user by id

- Method: GET
- Path: `/users/:id`
- Params: `id` (uuid)
- Response: 200

```json
{
  "user": {
    "id": "uuid",
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "contact_number": "...",
    "role": "..."
  }
}
```

- cURL

```bash
USER_ID=replace-with-uuid
curl http://localhost:3005/api/users/$USER_ID
```

### Update user

- Method: PUT
- Path: `/users/:id`
- Params: `id` (uuid)
- Body (all fields optional):

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "contact_number": "+9876543210",
  "role": "admin"
}
```

- Response: 200

```json
{
  "user": {
    "id": "uuid",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "contact_number": "+9876543210",
    "role": "admin"
  }
}
```

- cURL

```bash
USER_ID=replace-with-uuid
curl -X PUT http://localhost:3005/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "email": "jane.doe@example.com"
  }'
```

### Delete user

- Method: DELETE
- Path: `/users/:id`
- Params: `id` (uuid)
- Response: 200

```json
{ "message": "User deleted successfully" }
```

- cURL

```bash
USER_ID=replace-with-uuid
curl -X DELETE http://localhost:3005/api/users/$USER_ID
```

---

## Orders

### Create order

- Method: POST
- Path: `/orders`
- Body:

```json
{
  "user_id": "115de678-3e5c-4599-86ac-6b294934a2e4",
  "items": [
    {
      "product_id": "54c9132e-7540-40e7-8261-e2264c89ce7f",
      "quantity": 2,
      "price": 15.0
    },
    {
      "product_id": "a1b2c3d4-5678-90ab-cdef-123456789012",
      "quantity": 1,
      "price": 45.0
    }
  ],
  "description": "Complete beauty package - manicure, facial, and hair treatment",
  "payment_type": "Digital Wallet - PayPal"
}
```

- Response: 201

```json
{
  "id": "8013856c-4d89-44d6-a750-b2ec999fc501",
  "user_id": "115de678-3e5c-4599-86ac-6b294934a2e4",
  "description": "Complete beauty package - manicure, facial, and hair treatment",
  "payment_type": "Digital Wallet - PayPal",
  "amount": 75.0,
  "is_paid": false,
  "items": [
    {
      "id": "bf25d056-d213-461c-9c5d-a59851df57a4",
      "order_id": "8013856c-4d89-44d6-a750-b2ec999fc501",
      "product_id": "54c9132e-7540-40e7-8261-e2264c89ce7f",
      "quantity": 2,
      "price": 15.0,
      "created_at": "2025-09-24T14:48:11.633Z",
      "updated_at": "2025-09-24T14:48:11.633Z"
    },
    {
      "id": "c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6",
      "order_id": "8013856c-4d89-44d6-a750-b2ec999fc501",
      "product_id": "a1b2c3d4-5678-90ab-cdef-123456789012",
      "quantity": 1,
      "price": 45.0,
      "created_at": "2025-09-24T14:48:11.633Z",
      "updated_at": "2025-09-24T14:48:11.633Z"
    }
  ]
}
```

- cURL

```bash
curl -X POST http://localhost:3005/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "115de678-3e5c-4599-86ac-6b294934a2e4",
    "items": [
      {
        "product_id": "54c9132e-7540-40e7-8261-e2264c89ce7f",
        "quantity": 2,
        "price": 15.00
      }
    ],
    "description": "Complete beauty package order",
    "payment_type": "Credit Card"
  }'
```

---

## Salons

Currently implemented route:

### Create salon

- Method: POST
- Path: `/salon`
- Body:

```json
{
  "name": "My Salon",
  "type": "salon",
  "bio": "About us",
  "location": "Colombo",
  "contact_number": "+94112223344"
}
```

- Response: 201

```json
{
  "salon": {
    "id": "uuid",
    "name": "My Salon",
    "type": "salon",
    "bio": "About us",
    "location": "Colombo",
    "contact_number": "+94112223344",
    "created_at": "ISO",
    "updated_at": "ISO"
  }
}
```

- cURL

```bash
curl -X POST http://localhost:3005/api/salon \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Salon",
    "type": "salon",
    "bio": "About us",
    "location": "Colombo",
    "contact_number": "+94112223344"
  }'
```
