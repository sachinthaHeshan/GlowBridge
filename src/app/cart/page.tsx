'use client';

import { useCart } from '@/contexts/CartContext';
import { CartItemComponent } from '@/components/cart/CartItem';
import { formatPrice } from '@/utils/price';
import { LoadingSpinner, EmptyState } from '@/components/common/UIComponents';
import { groupCartItemsBySalon } from '@/utils/cart';
import { AppLayout } from '@/components/AppLayout';

function CartPageContent() {
  const { cart, totals, clearCart } = useCart();

  if (cart.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading your cart..." />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added any beauty products yet. Explore our marketplace to find amazing products from top salons."
            actionLabel="Start Shopping"
            onAction={() => window.location.href = '/'}
          />
        </div>
      </div>
    );
  }

  const groupedItems = groupCartItemsBySalon(cart.items);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Items by Salon */}
              <div className="divide-y divide-gray-200">
                {Object.entries(groupedItems).map(([salonName, items]) => (
                  <div key={salonName} className="p-6">
                    <h3 className="text-md font-medium text-blue-600 mb-4">
                      {salonName}
                    </h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                          <CartItemComponent item={item} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({totals.itemCount} items):
                  </span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>

                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Savings:</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(totals.totalDiscount)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(totals.finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Discount Summary */}
              {totals.totalDiscount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      You're saving {formatPrice(totals.totalDiscount)}!
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Security Note */}
              <div className="mt-6 text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center mb-1">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </div>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <AppLayout>
      <CartPageContent />
    </AppLayout>
  );
}
