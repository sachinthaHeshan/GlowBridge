export const calculateDiscountedPrice = (originalPrice: number, discount: number | null): number => {
  if (!discount || discount <= 0) return originalPrice;
  return Math.round(originalPrice * (1 - discount / 100));
};

export const formatPrice = (priceInCents: number): string => {
  // Convert cents to dollars for formatting
  const priceInDollars = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
  }).format(priceInDollars);
};

export const getDiscountPercentage = (discount: number | null): string => {
  if (!discount || discount <= 0) return '';
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
