import React, { useState } from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { 
  calculateDiscountedPrice, 
  formatPrice, 
  getDiscountPercentage, 
  isProductAvailable, 
  getAvailabilityStatus, 
  getAvailabilityColor 
} from '@/utils/price';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
  const hasDiscount = product.discount != null && product.discount > 0;
  const isAvailable = isProductAvailable(product.available_quantity);

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      setAddToCartError(null);
      await addToCart(product.id);
      
      // Show success feedback
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-600');
        }, 1500);
      }
    } catch (error) {
      setAddToCartError(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image Placeholder */}
      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image Available</div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {getDiscountPercentage(product.discount)}
          </div>
        )}
        
        {/* Out of Stock Badge */}
        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Salon Name */}
        <p className="text-sm text-blue-600 mb-2 font-medium">
          {product.salon_name}
        </p>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Availability Status */}
        <div className="mb-4">
          <span className={`text-sm font-medium ${getAvailabilityColor(product.available_quantity)}`}>
            {getAvailabilityStatus(product.available_quantity)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <div className="space-y-2">
          {addToCartError && (
            <p className="text-xs text-red-600">{addToCartError}</p>
          )}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isAddingToCart}
            className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 ${
              isAvailable && !isAddingToCart
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAddingToCart 
              ? 'Adding...' 
              : isAvailable 
              ? 'Add to Cart' 
              : 'Out of Stock'
            }
          </button>
        </div>
      </div>
    </div>
  );
};
