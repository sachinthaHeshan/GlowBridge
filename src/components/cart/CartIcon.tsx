'use client';

import { useCart } from '@/contexts/CartContext';

export const CartIcon = () => {
  const { totals, setIsCartOpen } = useCart();

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      aria-label={`Shopping cart with ${totals.itemCount} items`}
    >
      {/* Cart Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m4.5-5h6m-6 0v7a2 2 0 01-2 2H9a2 2 0 01-2-2v-7m4-5V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2"
        />
      </svg>
      
      {/* Item Count Badge */}
      {totals.itemCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {totals.itemCount > 99 ? '99+' : totals.itemCount}
        </div>
      )}
    </button>
  );
};
