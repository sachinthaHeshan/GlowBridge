import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  salon_name: string;
  discount?: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface BeautyMarketplaceProps {
  initialProducts?: Product[];
}

export function BeautyMarketplace({ initialProducts = [] }: BeautyMarketplaceProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts();
    }
    fetchCartItems();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/products?limit=12&page=1`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
        console.log('Products loaded:', data.data?.length || 0);
      } else {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/cart`);
      if (response.ok) {
        const cartData = await response.json();
        // Transform cart data to match our interface
        const transformedCart = cartData.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          product: item.product
        }));
        setCartItems(transformedCart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      if (response.ok) {
        // Refresh cart items
        await fetchCartItems();
        
        // Success - item added to cart (remove alert for better UX)
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Log error instead of showing alert
    } finally {
      setAddingToCart(null);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/cart/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCartItems();
        // Item removed successfully
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Log error instead of showing alert
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/cart`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCartItems([]);
        // Cart cleared successfully
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Log error instead of showing alert
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      // Cart is empty - could show a toast notification instead
      return;
    }
    
    // Navigate to payment page
    router.push('/payment');
  };

  const formatPrice = (priceInCents: number) => {
    return `Rs.${(priceInCents / 100).toFixed(2)}`;
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartValue = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  if (loading) {
    return (
      <div className="marketplace-loading-container">
        <div className="marketplace-loading-content">
          <div className="marketplace-loading-spinner"></div>
          <p className="marketplace-loading-title">Loading beautiful products...</p>
          <p className="marketplace-loading-subtitle">Finding the perfect items for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      {/* Header */}
      <header className="marketplace-header">
        <div className="marketplace-header-content">
          <div className="marketplace-header-left">
            <h1 className="marketplace-header-title">
              GlowBridge
            </h1>
            <p className="marketplace-header-subtitle">Beauty Marketplace</p>
          </div>
          <div className="marketplace-header-right">
            <button 
              onClick={toggleCart}
              className="marketplace-cart-button"
            >
              Cart ({getTotalCartItems()})
              {getTotalCartItems() > 0 && (
                <span className="marketplace-cart-badge">
                  {getTotalCartItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="marketplace-cart-overlay">
          <div className="marketplace-cart-backdrop" onClick={toggleCart}></div>
          <div className="marketplace-cart-sidebar">
            <div className="marketplace-cart-content">
              <div className="marketplace-cart-header">
                <h2 className="marketplace-cart-title">Shopping Cart</h2>
                <button 
                  onClick={toggleCart}
                  className="marketplace-cart-close"
                >
                  ✕
                </button>
              </div>
              
              {cartItems.length > 0 ? (
                <>
                  <div className="marketplace-cart-items">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="marketplace-cart-item">
                        <div className="marketplace-cart-item-image">
                          <span className="marketplace-cart-item-placeholder">ITEM</span>
                        </div>
                        <div className="marketplace-cart-item-details">
                          <h3 className="marketplace-cart-item-name">{item.product?.name || 'Unknown Product'}</h3>
                          <p className="marketplace-cart-item-quantity">Qty: {item.quantity}</p>
                          <p className="marketplace-cart-item-price">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="marketplace-cart-item-remove"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="marketplace-cart-footer">
                    <div className="marketplace-cart-total">
                      <span className="marketplace-cart-total-text">Total: {formatPrice(getTotalCartValue())}</span>
                    </div>
                    <div className="marketplace-cart-actions">
                      <button 
                        onClick={handleCheckout}
                        className="marketplace-cart-checkout"
                      >
                        Checkout
                      </button>
                      <button 
                        onClick={clearCart}
                        className="marketplace-cart-clear"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="marketplace-cart-empty">
                  <div className="marketplace-cart-empty-icon">
                    <span className="marketplace-cart-empty-text">CART</span>
                  </div>
                  <p className="marketplace-cart-empty-title">Your cart is empty</p>
                  <p className="marketplace-cart-empty-subtitle">Add some beautiful products to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="marketplace-main-content">
        {error && (
          <div className="marketplace-error-alert">
            <div className="marketplace-error-content">
              <h3 className="marketplace-error-title">Error</h3>
              <div className="marketplace-error-message">
                <p>{error}</p>
              </div>
              <div className="marketplace-error-actions">
                <button
                  onClick={fetchProducts}
                  className="marketplace-error-retry"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="marketplace-products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="marketplace-product-card"
              >
                <div className="marketplace-product-image">
                  <span className="marketplace-product-placeholder">PRODUCT</span>
                  {product.discount && product.discount > 0 && (
                    <div className="marketplace-product-discount">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                <div className="marketplace-product-content">
                  <h3 className="marketplace-product-title">
                    {product.name}
                  </h3>
                  <p className="marketplace-product-description">
                    {product.description}
                  </p>
                  <div className="marketplace-product-price-section">
                    <span className="marketplace-product-price">
                      {formatPrice(product.price)}
                    </span>
                    <span className="marketplace-product-stock">
                      Stock: {product.available_quantity}
                    </span>
                  </div>
                  <p className="marketplace-product-salon">
                    by {product.salon_name}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="marketplace-product-add-button"
                    disabled={product.available_quantity === 0 || addingToCart === product.id}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <span className="marketplace-button-spinner">...</span>
                        Adding...
                      </>
                    ) : product.available_quantity > 0 ? (
                      <>Add to Cart</>
                    ) : (
                      'Out of Stock'
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="marketplace-no-products">
                <div className="marketplace-no-products-icon">
                  <span className="marketplace-no-products-text">SHOP</span>
                </div>
                <h3 className="marketplace-no-products-title">No products found</h3>
                <p className="marketplace-no-products-message">
                  We couldn't find any products. This might be because the backend is not connected to the database.
                </p>
                <button
                  onClick={fetchProducts}
                  className="marketplace-no-products-refresh"
                >
                  Refresh Products
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="marketplace-footer">
        <div className="marketplace-footer-content">
          <div className="marketplace-footer-main">
            <div className="marketplace-footer-title">
              GlowBridge Beauty Marketplace
            </div>
            <div className="marketplace-footer-stats">
              <div className="marketplace-footer-stat">
                <p className="marketplace-footer-stat-title">Cart Summary</p>
                <p className="marketplace-footer-stat-value">
                  Items: {getTotalCartItems()} | Value: {formatPrice(getTotalCartValue())}
                </p>
              </div>
              <div className="marketplace-footer-stat">
                <p className="marketplace-footer-stat-title">Products Available</p>
                <p className="marketplace-footer-stat-value">{products.length} beautiful items</p>
              </div>
            </div>
            <p className="marketplace-footer-tagline">
              Enjoy your beautiful shopping experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
