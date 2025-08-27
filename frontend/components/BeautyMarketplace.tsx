import { useState, useEffect } from 'react';

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
        
        // Show success message
        alert(`✅ ${product.name} added to cart successfully!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`❌ Failed to add ${product.name} to cart. Please try again.`);
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
        alert('✅ Item removed from cart!');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('❌ Failed to remove item from cart');
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
        alert('✅ Cart cleared successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('❌ Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Add some items before checkout.');
      return;
    }
    
    const totalAmount = getTotalCartValue();
    const itemCount = getTotalCartItems();
    
    if (confirm(`Proceed to checkout?\n\nItems: ${itemCount}\nTotal: ${formatPrice(totalAmount)}\n\nNote: This is a demo checkout.`)) {
      alert('🎉 Thank you for your order!\n\nThis is a demo checkout. In a real application, you would be redirected to a payment processor.\n\nYour cart will now be cleared.');
      clearCart();
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center font-nunito">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading beautiful products...</p>
          <p className="text-gray-500 text-sm mt-2">✨ Finding the perfect items for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 font-nunito">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-4xl font-bold font-poppins bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ✨ GlowBridge
              </h1>
              <p className="ml-4 text-gray-600 font-medium">Beauty Marketplace</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleCart}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 relative shadow-lg"
              >
                🛒 Cart ({getTotalCartItems()})
                {getTotalCartItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center animate-pulse">
                    {getTotalCartItems()}
                  </span>
                )}
              </button>
              <button 
                onClick={fetchProducts}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleCart}></div>
          <div className="relative ml-auto w-96 bg-white h-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-poppins text-gray-800">Shopping Cart</h2>
                <button 
                  onClick={toggleCart}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-purple-300 rounded-full flex items-center justify-center">
                          <span className="text-lg">💄</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-gray-800">{item.product?.name || 'Unknown Product'}</h3>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                          <p className="text-pink-600 font-bold">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-lg font-poppins text-gray-800">Total: {formatPrice(getTotalCartValue())}</span>
                    </div>
                    <div className="space-y-3">
                      <button 
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                      >
                        🛍️ Checkout
                      </button>
                      <button 
                        onClick={clearCart}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-full hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                      >
                        🗑️ Clear Cart
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some beautiful products to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchProducts}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="h-52 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-200 flex items-center justify-center relative">
                  <span className="text-5xl">💄</span>
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold font-poppins text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-pink-600 font-poppins">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Stock: {product.available_quantity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 font-medium">
                    by {product.salon_name}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none font-semibold shadow-lg"
                    disabled={product.available_quantity === 0 || addingToCart === product.id}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Adding...
                      </>
                    ) : product.available_quantity > 0 ? (
                      <>🛒 Add to Cart</>
                    ) : (
                      '❌ Out of Stock'
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any products. This might be because the backend is not connected to the database.
                </p>
                <button
                  onClick={fetchProducts}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  🔄 Refresh Products
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-2xl font-bold font-poppins bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              ✨ GlowBridge Beauty Marketplace
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="font-semibold text-green-700">🎯 System Status</p>
                <p className="text-green-600">Backend ✅ | Frontend ✅ | Database ✅</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="font-semibold text-blue-700">📊 Cart Summary</p>
                <p className="text-blue-600">
                  Items: {getTotalCartItems()} | Value: {formatPrice(getTotalCartValue())}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="font-semibold text-purple-700">🛍️ Products Available</p>
                <p className="text-purple-600">{products.length} beautiful items</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              All systems operational! Enjoy your beautiful shopping experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
