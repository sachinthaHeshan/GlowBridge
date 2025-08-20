# 🚀 GlowBridge Neon PostgreSQL Setup Guide

## 📋 Prerequisites
- Node.js 18+ installed
- A Neon PostgreSQL account (https://neon.tech)
- Your GlowBridge project cloned and dependencies installed

## 🔧 Step 1: Get Your Neon Database Credentials

### 1.1 Create a Neon Project
1. Go to [Neon Console](https://console.neon.tech)
2. Click "Create Project"
3. Choose a project name (e.g., "GlowBridge")
4. Select a region closest to you
5. Click "Create Project"

### 1.2 Get Connection String
1. In your Neon dashboard, go to "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## 🌐 Step 2: Configure Environment Variables

### 2.1 Update .env.local
Replace the placeholder values in your `.env.local` file with your actual Neon credentials:

```env
# Neon PostgreSQL Configuration
DATABASE_URL="postgresql://your-username:your-password@your-endpoint.aws.neon.tech/neondb?sslmode=require"

# Alternative individual parameters (if needed)
DB_HOST="your-endpoint.aws.neon.tech"
DB_PORT="5432"
DB_NAME="neondb"
DB_USER="your-username"
DB_PASSWORD="your-password"
DB_SSL="true"

# Application Settings
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# PayHere Configuration (for checkout)
PAYHERE_MERCHANT_ID="your-merchant-id"
PAYHERE_MERCHANT_SECRET="your-merchant-secret"
PAYHERE_SANDBOX_MODE="true"
```

### 2.2 Security Notes
- ✅ Never commit `.env.local` to version control
- ✅ The `.env.example` shows the required format
- ✅ Use strong passwords for production

## 🗄️ Step 3: Initialize Database Schema

### 3.1 Run the Database Schema
You have several options to create the tables:

#### Option A: Using Neon Console (Recommended)
1. Go to your Neon project dashboard
2. Click on "SQL Editor"
3. Copy the contents of `database/init.sql`
4. Paste and execute the SQL script

#### Option B: Using a PostgreSQL Client
```bash
# Install psql client (if not installed)
# Then connect and run the schema
psql "postgresql://your-connection-string" -f database/init.sql
```

#### Option C: Using our API (after connection is working)
The schema will be automatically created when you first run the application.

## 🧪 Step 4: Test Database Connection

### 4.1 Run Connection Test
```bash
npm run test-db
```

Expected output:
```
🔌 Testing Neon PostgreSQL connection...
✅ Successfully connected to Neon PostgreSQL!

📊 Testing database queries...
📋 Available tables:
   - cart
   - order
   - order_item
   - product
   - salon
   - user
   ... (and more)

🎉 All database tests passed!
```

### 4.2 If Connection Fails
Check these common issues:

1. **Invalid credentials**: Verify your DATABASE_URL in `.env.local`
2. **Network issues**: Ensure your internet connection is stable
3. **SSL configuration**: Neon requires SSL, make sure `sslmode=require` is in your connection string
4. **Firewall**: Check if your network blocks PostgreSQL connections (port 5432)

## 🚀 Step 5: Start Development Server

### 5.1 Start the Application
```bash
npm run dev
```

The application should start at `http://localhost:3000`

### 5.2 Test Database Integration
1. Visit the products page: `http://localhost:3000`
2. Try adding items to cart
3. Go through the checkout process
4. Check the database for new records

## 📊 Step 6: Verify Database Operations

### 6.1 Test API Endpoints
Use these endpoints to test database connectivity:

```bash
# Get products from database
curl http://localhost:3000/api/products/database

# Get salons
curl http://localhost:3000/api/salons

# Test cart operations (requires user authentication)
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"product_id": "some-uuid", "quantity": 1}'
```

### 6.2 Monitor Database Activity
In Neon Console:
1. Go to "Monitoring" tab
2. Watch for query activity
3. Check connection count
4. Monitor performance metrics

## 🔒 Step 7: Security & Production Setup

### 7.1 For Production Deployment
- Create a separate Neon project for production
- Use environment-specific connection strings
- Enable connection pooling
- Set up monitoring and alerts

### 7.2 Backup Strategy
- Neon provides automatic backups
- Consider additional backup strategies for critical data
- Test restore procedures regularly

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. "Connection refused" Error
```
Error: connect ECONNREFUSED
```
**Solution**: Check your DATABASE_URL format and network connectivity

#### 2. "SSL required" Error
```
Error: no pg_hba.conf entry for host
```
**Solution**: Ensure your connection string includes `?sslmode=require`

#### 3. "Database does not exist" Error
```
Error: database "your-db" does not exist
```
**Solution**: Verify the database name in your connection string

#### 4. "Too many connections" Error
```
Error: sorry, too many clients already
```
**Solution**: Check your connection pooling settings or upgrade your Neon plan

### Debug Commands

```bash
# Test basic connectivity
npm run test-db

# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Manual database query test
node -e "const { Client } = require('pg'); const client = new Client(process.env.DATABASE_URL); client.connect().then(() => console.log('Connected!')).catch(console.error);"
```

## 📚 Next Steps

1. **Data Migration**: Import your existing data if migrating from another database
2. **Performance Optimization**: Set up indexes for frequently queried columns
3. **Monitoring**: Set up alerts for database performance and errors
4. **Scaling**: Plan for connection pooling and read replicas as you grow

## 🔗 Useful Links

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Library](https://node-postgres.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 💡 Tips for Success

1. **Start Small**: Test with a few products before bulk operations
2. **Monitor Performance**: Keep an eye on query performance and connection usage
3. **Use Transactions**: For multi-step operations like checkout
4. **Error Handling**: Implement proper error handling for database operations
5. **Connection Pooling**: Use connection pooling for better performance

---

**Need Help?** 
- Check the Neon community forums
- Review the application logs for specific error messages
- Test individual database operations to isolate issues

Happy coding! 🎉
