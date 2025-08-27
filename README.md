# GlowBridge - Beauty Marketplace

## 🎯 New Project Structure

This project has been reorganized into a modern, scalable full-stack architecture with clear separation of concerns:

```
glowbridge-project/
├── backend/                 # Express.js REST API Server
│   ├── models/             # Database models (User, Product, Cart, Order)
│   ├── routes/             # API routes (auth, products, cart, orders)
│   ├── middleware/         # Custom middleware (auth, validation, error handling)
│   ├── config/             # Configuration files (database, etc.)
│   ├── services/           # Business logic services
│   ├── .env.example        # Environment variables template
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
└── frontend/               # Next.js React Application
    ├── pages/              # Next.js pages
    ├── components/         # Reusable React components
    ├── context/            # React context providers
    ├── hooks/              # Custom React hooks
    ├── lib/                # Utility libraries
    ├── styles/             # CSS and styling files
    ├── public/             # Static assets
    └── package.json        # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd glowbridge-project/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd glowbridge-project/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Products
- `GET /products` - Get all products (with filtering)
- `GET /products/:id` - Get specific product
- `GET /products/salon/:salonId` - Get products by salon

### Cart
- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/:productId` - Update cart item quantity
- `DELETE /cart/:productId` - Remove item from cart
- `DELETE /cart` - Clear entire cart

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get specific order
- `PUT /orders/:id/status` - Update order status

## 🛠 Key Improvements

### ✅ Better Architecture
- **Separation of Concerns**: Backend and frontend are completely separate
- **Scalability**: Each part can be scaled independently
- **Team Collaboration**: Frontend and backend teams can work independently
- **Deployment Flexibility**: Can deploy to different servers/services

### ✅ Modern Tech Stack
- **Backend**: Express.js + PostgreSQL + JWT Authentication
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **State Management**: Zustand for global state
- **API Client**: Axios with interceptors for auth
- **Validation**: Joi for backend, Zod for frontend

### ✅ Production Ready
- **Error Handling**: Comprehensive error handling middleware
- **Security**: Helmet, CORS, rate limiting, JWT tokens
- **Database**: Connection pooling, transactions
- **Logging**: Request logging with Morgan
- **Validation**: Input validation on both ends

### ✅ Developer Experience
- **Hot Reload**: Both backend (nodemon) and frontend (Next.js)
- **TypeScript**: Full type safety on frontend
- **ESLint**: Code quality and consistency
- **Environment Variables**: Proper configuration management

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=glowbridge
DB_USER=your_username
DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=12
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📦 Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🚢 Deployment

### Backend Deployment
- Deploy to services like Heroku, Railway, or DigitalOcean
- Set environment variables on the platform
- Ensure PostgreSQL database is accessible

### Frontend Deployment
- Deploy to Vercel, Netlify, or any static hosting
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Build static files: `npm run build`

## 🔄 Migration from Old Structure

The old Next.js API routes have been converted to Express.js routes:
- `src/app/api/products/route.ts` → `backend/routes/products.js`
- `src/app/api/cart/route.ts` → `backend/routes/cart.js`
- `src/app/api/orders/route.ts` → `backend/routes/orders.js`

Frontend components can be migrated from `src/components/` to `frontend/components/` with minimal changes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both backend and frontend
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
