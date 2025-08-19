# GlowBridge - Beauty Products Marketplace

A comprehensive React component for an online beauty product marketplace that displays products from salons with advanced filtering, sorting, and pagination capabilities.

## Features

### 🛍️ Product Display
- **Responsive Grid Layout**: Products displayed in a responsive grid using Tailwind CSS
- **Product Cards**: Each card shows:
  - Product image placeholder
  - Product name and description
  - Salon name
  - Original and discounted prices
  - Availability status
  - Discount percentage badge
  - "Add to Cart" button (disabled for out-of-stock items)
  - "Out of Stock" badge when needed

### 🔍 Filtering & Search
- **Search**: Search products by name
- **Salon Filter**: Filter products by specific salon
- **Price Range**: Set minimum and maximum price filters
- **Availability**: Show only in-stock products
- **Discount Status**: Show only products with discounts

### 📊 Sorting Options
- **Price**: Low to High / High to Low
- **Newest First**: Most recently added products
- **Highest Discount**: Products with the highest discount percentage

### 📄 Pagination
- **Page Navigation**: Navigate between pages with previous/next buttons
- **Page Numbers**: Click specific page numbers
- **Items Count**: Shows current items range and total count
- **Responsive**: Mobile-friendly pagination controls

### 💰 Price Calculations
- **Discount Calculation**: Automatic calculation of discounted prices
- **Price Formatting**: Currency formatting for all prices
- **Discount Badges**: Visual indication of discount percentages

## Database Schema

The component expects products with the following PostgreSQL fields:

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    salon_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- in cents
    available_quantity INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT true,
    discount INTEGER NOT NULL DEFAULT 0, -- percentage
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET /api/products
Fetch products with filtering, sorting, and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `sort` (string): Sort option (`newest`, `price_asc`, `price_desc`, `highest_discount`)
- `salon_id` (string): Filter by salon ID
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `in_stock_only` (boolean): Show only in-stock products
- `has_discount` (boolean): Show only products with discounts
- `search` (string): Search by product name

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "salon_id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 89.99,
      "available_quantity": 15,
      "is_public": true,
      "discount": 20,
      "salon_name": "Salon Name",
      "created_at": "2024-01-15"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 48,
    "items_per_page": 12
  }
}
```

### GET /api/salons
Fetch all salons for the filter dropdown.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Salon Name"
  }
]
```

## Components Structure

```
src/
├── components/
│   ├── BeautyMarketplace.tsx    # Main marketplace component
│   ├── ProductCard.tsx          # Individual product card
│   ├── ProductFilters.tsx       # Filtering and search UI
│   └── Pagination.tsx           # Pagination controls
├── services/
│   └── productService.ts        # API service layer
├── types/
│   └── product.ts               # TypeScript interfaces
├── utils/
│   └── price.ts                 # Price calculation utilities
└── app/
    ├── api/
    │   ├── products/route.ts    # Products API endpoint
    │   └── salons/route.ts      # Salons API endpoint
    └── page.tsx                 # Main page using marketplace
```

## Usage

Import and use the main marketplace component:

```tsx
import { BeautyMarketplace } from '@/components/BeautyMarketplace';

export default function HomePage() {
  return <BeautyMarketplace />;
}
```

## Styling

The component uses Tailwind CSS for styling with a clean, modern design:
- **Color Scheme**: Professional blue and gray palette
- **Responsive**: Mobile-first responsive design
- **Hover Effects**: Subtle hover animations
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## Error Handling

- **API Errors**: Graceful error handling with retry options
- **Loading States**: Loading spinners during data fetching
- **Empty States**: Helpful messages when no products are found
- **Fallbacks**: Mock data fallback for development

## Performance Features

- **Pagination**: Reduces initial load time
- **Lazy Loading**: Only loads visible content
- **Optimized Images**: Placeholder system for images
- **Efficient Filtering**: Client-side filtering where appropriate
- **Memoization**: React hooks optimization

## Development

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **View Application**:
   Open [http://localhost:3000](http://localhost:3000)

3. **API Testing**:
   - Products: `GET http://localhost:3000/api/products`
   - Salons: `GET http://localhost:3000/api/salons`

## Next Steps

1. **Database Integration**: Replace mock data with actual PostgreSQL queries
2. **Authentication**: Add user authentication for personalized features
3. **Cart Functionality**: Implement shopping cart and checkout
4. **Image Upload**: Add product image upload and management
5. **Reviews**: Add product reviews and ratings
6. **Admin Panel**: Create admin interface for product management

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **PostgreSQL**: Database (schema provided)
- **React Hooks**: State management and effects

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the GlowBridge beauty marketplace platform.
