export const calculateDiscountedPrice = (originalPrice: number, discount: number): number => {
  if (discount <= 0) return originalPrice;
  return Math.round(originalPrice * (1 - discount / 100));
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const getDiscountPercentage = (discount: number): string => {
  return `${discount}% OFF`;
};

export const isProductAvailable = (quantity: number): boolean => {
  return quantity > 0;
};

export const getAvailabilityStatus = (quantity: number): string => {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= 5) return `Only ${quantity} left`;
  return 'In Stock';
};

export const getAvailabilityColor = (quantity: number): string => {
  if (quantity === 0) return 'text-red-600';
  if (quantity <= 5) return 'text-orange-600';
  return 'text-green-600';
};
