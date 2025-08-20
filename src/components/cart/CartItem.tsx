'use client';

import { useState } from 'react';
import { CartItem } from '@/types/cart';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/price';
import { getItemSubtotal, validateCartItemQuantity } from '@/utils/cart';

interface CartItemComponentProps {
  item: CartItem;
}

export const CartItemComponent = ({ item }: CartItemComponentProps) => {
  const { updateCartItem, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = async (newQuantity: number) => {
    if (!item.product) return;

    // Validate quantity
    const validation = validateCartItemQuantity(
      newQuantity,
      item.product.available_quantity,
      0
    );

    if (!validation.isValid) {
      setError(validation.error || 'Invalid quantity');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      await updateCartItem(item.id, newQuantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUpdating(true);
      await removeFromCart(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      setIsUpdating(false);
    }
  };

  if (!item.product) {
    return null;
  }

  const subtotal = getItemSubtotal(item);
  const hasDiscount = (item.product.discount || 0) > 0;

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-blue-600 mt-1">
          {item.product.salon_name}
        </p>
        
        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(subtotal)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating || item.quantity >= item.product.available_quantity}
          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
        aria-label="Remove item from cart"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
