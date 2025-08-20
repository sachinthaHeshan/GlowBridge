import { CartItem, CartTotals } from '@/types/cart';
import { calculateDiscountedPrice } from './price';

export const calculateCartTotals = (items: CartItem[]): CartTotals => {
  let subtotal = 0;
  let totalDiscount = 0;
  let itemCount = 0;

  items.forEach(item => {
    if (item.product) {
      const originalPrice = item.product.price;
      const discountedPrice = calculateDiscountedPrice(originalPrice, item.product.discount);
      const itemSubtotal = originalPrice * item.quantity;
      const itemDiscountedTotal = discountedPrice * item.quantity;
      
      subtotal += itemSubtotal;
      totalDiscount += (itemSubtotal - itemDiscountedTotal);
      itemCount += item.quantity;
    }
  });

  const finalTotal = subtotal - totalDiscount;

  return {
    subtotal,
    totalDiscount,
    finalTotal,
    itemCount,
  };
};

export const getItemSubtotal = (item: CartItem): number => {
  if (!item.product) return 0;
  const discountedPrice = calculateDiscountedPrice(item.product.price, item.product.discount);
  return discountedPrice * item.quantity;
};

export const getItemOriginalSubtotal = (item: CartItem): number => {
  if (!item.product) return 0;
  return item.product.price * item.quantity;
};

export const getItemDiscount = (item: CartItem): number => {
  if (!item.product) return 0;
  const originalSubtotal = getItemOriginalSubtotal(item);
  const discountedSubtotal = getItemSubtotal(item);
  return originalSubtotal - discountedSubtotal;
};

export const validateCartItemQuantity = (
  requestedQuantity: number,
  availableQuantity: number,
  currentCartQuantity: number = 0
): { isValid: boolean; maxAllowed: number; error?: string } => {
  const maxAllowed = availableQuantity;
  
  if (requestedQuantity <= 0) {
    return {
      isValid: false,
      maxAllowed,
      error: 'Quantity must be greater than 0',
    };
  }

  if (requestedQuantity > maxAllowed) {
    return {
      isValid: false,
      maxAllowed,
      error: `Only ${maxAllowed} items available in stock`,
    };
  }

  return {
    isValid: true,
    maxAllowed,
  };
};

export const groupCartItemsBySalon = (items: CartItem[]): Record<string, CartItem[]> => {
  return items.reduce((groups, item) => {
    if (item.product && item.product.salon_name) {
      const salonName = item.product.salon_name;
      if (!groups[salonName]) {
        groups[salonName] = [];
      }
      groups[salonName].push(item);
    }
    return groups;
  }, {} as Record<string, CartItem[]>);
};
