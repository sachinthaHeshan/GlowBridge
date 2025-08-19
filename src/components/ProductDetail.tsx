'use client';

import React, { useState, useEffect } from 'react';
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

interface ProductDetailProps {
  productId: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const productData = await response.json();
      setProduct(productData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
      // Show success feedback
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.available_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-300 h-20 w-20 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 rounded"></div>
              <div className="bg-gray-300 h-6 rounded w-3/4"></div>
              <div className="bg-gray-300 h-6 rounded w-1/2"></div>
              <div className="bg-gray-300 h-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
  const hasDiscount = product.discount != null && product.discount > 0;
  const isAvailable = isProductAvailable(product.available_quantity);

  // Mock images for now - you can replace with actual product images
  const productImages = [
    '/placeholder-product.jpg',
    '/placeholder-product.jpg',
    '/placeholder-product.jpg',
    '/placeholder-product.jpg'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <span>Beauty Products</span>
        <span className="mx-2">›</span>
        <span>{product.salon_name}</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-square flex items-center justify-center">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-lg">No Image Available</div>
              )}
            </div>
            
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {getDiscountPercentage(product.discount)}
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="flex space-x-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-20 h-20 bg-gray-100 rounded border-2 ${
                  selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                } overflow-hidden`}
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Product Title & Brand */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-blue-600 font-medium">
              Brand: {product.salon_name}
            </p>
          </div>

          {/* Ratings (placeholder for now) */}
          <div className="flex items-center space-x-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(4)}{'☆'.repeat(1)}
            </div>
            <span className="text-sm text-gray-600">(4.0)</span>
            <span className="text-sm text-blue-600">25 Reviews</span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-green-600 font-medium">
                    -{getDiscountPercentage(product.discount)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${getAvailabilityColor(product.available_quantity)}`}>
              {getAvailabilityStatus(product.available_quantity)}
            </span>
            <span className="text-gray-600 text-sm">
              ({product.available_quantity} units available)
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="font-medium text-gray-900">Quantity</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min="1"
                max={product.available_quantity}
                className="w-16 h-10 text-center border border-gray-300 rounded-md"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.available_quantity}
                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || isAddingToCart}
              className={`w-full py-3 px-6 rounded-md font-medium text-lg transition-colors ${
                isAvailable && !isAddingToCart
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
            
            <button
              disabled={!isAvailable}
              className={`w-full py-3 px-6 rounded-md font-medium text-lg transition-colors ${
                isAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>
          </div>

          {/* Delivery Information */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Delivery & Services</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>Cash on Delivery Available</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">🚚</span>
                </div>
                <span>Standard Delivery (3-5 business days)</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-xs">↩</span>
                </div>
                <span>7 days easy return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
