# GlowBridge Shopping Cart System

A complete shopping cart system for the beauty product marketplace with CRUD operations, PostgreSQL integration, animations, and TypeScript support.

## 🛒 Features

### Core Cart Functionality
- **Add to Cart**: Add products with quantity validation
- **Update Quantity**: Modify item quantities with stock validation
- **Remove Items**: Remove individual items from cart
- **Clear Cart**: Empty entire cart with confirmation
- **Real-time Sync**: Persist cart data in PostgreSQL database

### State Management
- **React Context API**: Centralized cart state management
- **TypeScript Support**: Fully typed cart operations
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Visual feedback for all cart operations

### User Interface
- **Cart Icon**: Header cart icon with item count badge
- **Animated Sidebar**: Smooth slide-in cart sidebar with Framer Motion
- **Cart Page**: Full-page cart view with detailed item management
- **Responsive Design**: Mobile-friendly cart interface

### Validation & Business Logic
- **Stock Validation**: Prevent adding more items than available
- **Quantity Limits**: Enforce minimum and maximum quantities
- **Out-of-Stock Handling**: Disable cart actions for unavailable products
- **Price Calculations**: Real-time subtotal, discount, and total calculations

## 🗄️ Database Schema

### PostgreSQL Table: `shopping_cart_item`

```sql
CREATE TABLE shopping_cart_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, product_id) -- Prevent duplicate items per user
);

-- Index for faster queries
CREATE INDEX idx_cart_user_id ON shopping_cart_item(user_id);
CREATE INDEX idx_cart_product_id ON shopping_cart_item(product_id);
```

### Related Tables

```sql
-- Users table (for authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Products table (existing)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT true,
    discount INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### GET /api/cart
Fetch user's cart items with product details.

**Response:**
```json
[
  {
    "id": "cart-item-uuid",
    "user_id": "user-uuid",
    "product_id": "product-uuid",
    "quantity": 2,
    "product": {
      "id": "product-uuid",
      "name": "Luxury Facial Cream",
      "description": "Premium anti-aging cream",
      "price": 89.99,
      "available_quantity": 15,
      "discount": 20,
      "salon_name": "Bella Beauty Salon",
      "image_url": "/images/facial-cream.jpg"
    }
  }
]
```

### POST /api/cart
Add item to cart or update existing item quantity.

**Request:**
```json
{
  "product_id": "product-uuid",
  "quantity": 1
}
```

**Response:**
```json
{
  "id": "cart-item-uuid",
  "user_id": "user-uuid",
  "product_id": "product-uuid",
  "quantity": 1,
  "product": { /* product details */ }
}
```

### PUT /api/cart/[id]
Update cart item quantity.

**Request:**
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/[id]
Remove specific item from cart.

**Response:**
```json
{
  "message": "Item removed from cart successfully"
}
```

### DELETE /api/cart
Clear entire user cart.

**Response:**
```json
{
  "message": "Cart cleared successfully"
}
```

## 📁 File Structure

```
src/
├── contexts/
│   └── CartContext.tsx          # React Context for cart state
├── services/
│   └── cartService.ts          # API service layer
├── utils/
│   └── cart.ts                 # Cart calculations and utilities
├── types/
│   └── cart.ts                 # TypeScript interfaces
├── components/
│   ├── cart/
│   │   ├── CartIcon.tsx        # Header cart icon with badge
│   │   ├── CartItem.tsx        # Individual cart item component
│   │   ├── CartSidebar.tsx     # Static cart sidebar
│   │   └── AnimatedCartSidebar.tsx # Animated cart sidebar
│   ├── AppLayout.tsx           # Main layout wrapper
│   └── Header.tsx              # Site header with cart icon
├── app/
│   ├── cart/
│   │   └── page.tsx            # Full cart page
│   └── api/
│       └── cart/
│           ├── route.ts        # Main cart API routes
│           └── [id]/
│               └── route.ts    # Individual item operations
```

## 🎨 Components

### CartContext
```tsx
const { 
  cart,           // { items, isLoading, error }
  totals,         // { subtotal, totalDiscount, finalTotal, itemCount }
  addToCart,      // (productId, quantity) => Promise<void>
  updateCartItem, // (itemId, quantity) => Promise<void>
  removeFromCart, // (itemId) => Promise<void>
  clearCart,      // () => Promise<void>
  isCartOpen,     // boolean
  setIsCartOpen   // (open: boolean) => void
} = useCart();
```

### Usage Example
```tsx
import { useCart } from '@/contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      // Show success feedback
    } catch (error) {
      // Handle error
    }
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

## 🎭 Animations

### Framer Motion Features
- **Sidebar Transitions**: Smooth slide-in/out animations
- **Item Animations**: Staggered item appearance
- **Loading States**: Fade-in loading spinners
- **Button Interactions**: Hover and tap animations
- **Cart Badge**: Pulse animation for item count

### Animation Examples
```tsx
// Sidebar animation
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 20 }}
>

// Item stagger
{items.map((item, index) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
))}
```

## 💰 Price Calculations

### Total Calculations
```typescript
interface CartTotals {
  subtotal: number;      // Sum of original prices × quantities
  totalDiscount: number; // Total discount amount saved
  finalTotal: number;    // Subtotal minus total discount
  itemCount: number;     // Total number of items
}
```

### Discount Application
- Individual product discounts are applied automatically
- Discounts shown as savings in cart summary
- Final total reflects all applicable discounts

## ✅ Validation Rules

### Quantity Validation
- **Minimum**: 1 item per cart entry
- **Maximum**: Cannot exceed `available_quantity` from product
- **Stock Check**: Real-time validation against current inventory
- **Error Messages**: Clear feedback for validation failures

### Product Availability
- **Out of Stock**: Disable "Add to Cart" for zero inventory
- **Low Stock**: Show "Only X left" warnings
- **Stock Updates**: Real-time validation during cart operations

## 🔒 Error Handling

### Common Error Scenarios
1. **Product Not Found**: Invalid product ID
2. **Insufficient Stock**: Requested quantity exceeds availability
3. **Cart Item Not Found**: Invalid cart item ID
4. **Network Errors**: API request failures
5. **Authentication**: User not logged in (when auth is implemented)

### Error Display
- **Toast Notifications**: For quick feedback
- **Inline Errors**: Next to form inputs
- **Error Pages**: For critical failures
- **Retry Options**: Allow users to retry failed operations

## 🚀 Usage

### 1. Wrap App with Cart Provider
```tsx
import { CartProvider } from '@/contexts/CartContext';

function App() {
  return (
    <CartProvider>
      <YourApp />
    </CartProvider>
  );
}
```

### 2. Add Cart Icon to Header
```tsx
import { CartIcon } from '@/components/cart/CartIcon';

function Header() {
  return (
    <header>
      <CartIcon />
    </header>
  );
}
```

### 3. Include Cart Sidebar
```tsx
import { AnimatedCartSidebar } from '@/components/cart/AnimatedCartSidebar';

function Layout() {
  return (
    <>
      <YourContent />
      <AnimatedCartSidebar />
    </>
  );
}
```

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/glowbridge
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Cart Configuration
```typescript
// src/config/cart.ts
export const CART_CONFIG = {
  MAX_QUANTITY_PER_ITEM: 99,
  AUTO_SAVE_DELAY: 1000, // ms
  ANIMATION_DURATION: 300, // ms
  MAX_ITEMS_IN_CART: 50,
};
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### Test Coverage
- Cart operations (add, update, remove, clear)
- Price calculations
- Validation logic
- Error handling
- Component rendering

## 🚧 Future Enhancements

1. **User Authentication**: Integrate with auth system
2. **Saved Carts**: Persist carts for guest users
3. **Wishlist Integration**: Move items between cart and wishlist
4. **Bulk Operations**: Select and modify multiple items
5. **Cart Analytics**: Track cart abandonment and conversion
6. **Promotion Codes**: Apply discount codes at checkout
7. **Shipping Calculator**: Estimate shipping costs
8. **Stock Notifications**: Alert when out-of-stock items return

## 📊 Performance

### Optimizations
- **Debounced Updates**: Prevent excessive API calls
- **Optimistic Updates**: Immediate UI feedback
- **Memoized Calculations**: Cache expensive computations
- **Lazy Loading**: Load cart data only when needed
- **Error Recovery**: Graceful degradation on failures

### Metrics
- **Cart Load Time**: < 500ms
- **Add to Cart**: < 200ms
- **Update Quantity**: < 300ms
- **Price Calculations**: < 50ms

## 🛠️ Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Next.js 15**: Full-stack framework
- **Framer Motion**: Animations
- **Tailwind CSS**: Styling
- **PostgreSQL**: Database
- **React Context**: State management

## 📝 License

This shopping cart system is part of the GlowBridge beauty marketplace platform.
