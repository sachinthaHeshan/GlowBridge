import { 
  CheckoutFormData, 
  PaymentDetails, 
  OrderConfirmation, 
  OrderSummary,
  PaymentMethod,
  CheckoutValidationErrors 
} from '@/types/checkout';
import { CartItem } from '@/types/cart';

class CheckoutService {
  private readonly API_BASE = '/api';

  // Payment Methods Configuration
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'credit_card',
        type: 'credit_card',
        name: 'Credit Card',
        description: 'Visa, MasterCard, American Express',
        icon: '💳',
        processingFee: 0,
        isAvailable: true
      },
      {
        id: 'debit_card',
        type: 'debit_card',
        name: 'Debit Card',
        description: 'Pay directly from your bank account',
        icon: '💳',
        processingFee: 0,
        isAvailable: true
      },
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        description: 'Fast and secure payments',
        icon: '🅿️',
        processingFee: 2.5,
        isAvailable: true
      },
      {
        id: 'bank_transfer',
        type: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: '🏦',
        processingFee: 0,
        isAvailable: true
      },
      {
        id: 'cash_on_delivery',
        type: 'cash_on_delivery',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: '💵',
        processingFee: 5,
        isAvailable: true
      }
    ];
  }

  // Validate checkout form data
  validateCheckoutData(formData: CheckoutFormData, paymentDetails: PaymentDetails | null): CheckoutValidationErrors {
    const errors: CheckoutValidationErrors = {
      customerDetails: {},
      deliveryAddress: {},
      paymentDetails: {},
      general: []
    };

    // Validate customer details
    if (!formData.customerDetails.firstName.trim()) {
      errors.customerDetails!.firstName = 'First name is required';
    }
    if (!formData.customerDetails.lastName.trim()) {
      errors.customerDetails!.lastName = 'Last name is required';
    }
    if (!formData.customerDetails.email.trim()) {
      errors.customerDetails!.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerDetails.email)) {
      errors.customerDetails!.email = 'Please enter a valid email address';
    }
    if (!formData.customerDetails.contactNumber.trim()) {
      errors.customerDetails!.contactNumber = 'Contact number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.customerDetails.contactNumber)) {
      errors.customerDetails!.contactNumber = 'Please enter a valid contact number';
    }

    // Validate delivery address
    if (!formData.deliveryAddress.addressLine1.trim()) {
      errors.deliveryAddress!.addressLine1 = 'Address line 1 is required';
    }
    if (!formData.deliveryAddress.city.trim()) {
      errors.deliveryAddress!.city = 'City is required';
    }
    if (!formData.deliveryAddress.state.trim()) {
      errors.deliveryAddress!.state = 'State is required';
    }
    if (!formData.deliveryAddress.postalCode.trim()) {
      errors.deliveryAddress!.postalCode = 'Postal code is required';
    }
    if (!formData.deliveryAddress.country.trim()) {
      errors.deliveryAddress!.country = 'Country is required';
    }

    // Validate payment details
    if (!paymentDetails) {
      errors.general!.push('Please select a payment method');
    } else {
      if (paymentDetails.method.type === 'credit_card' || paymentDetails.method.type === 'debit_card') {
        if (!paymentDetails.cardNumber?.trim()) {
          errors.paymentDetails!.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
          errors.paymentDetails!.cardNumber = 'Please enter a valid 16-digit card number';
        }
        
        if (!paymentDetails.cardHolderName?.trim()) {
          errors.paymentDetails!.cardHolderName = 'Cardholder name is required';
        }
        
        if (!paymentDetails.expiryMonth || !paymentDetails.expiryYear) {
          errors.paymentDetails!.expiryMonth = 'Expiry date is required';
        }
        
        if (!paymentDetails.cvv?.trim()) {
          errors.paymentDetails!.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
          errors.paymentDetails!.cvv = 'Please enter a valid CVV';
        }
      }
    }

    return errors;
  }

  // Calculate order summary
  calculateOrderSummary(cartItems: CartItem[], paymentMethod?: PaymentMethod): OrderSummary {
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
    const discount = cartItems.reduce((total, item) => {
      const itemDiscount = item.product?.discount || 0;
      return total + (itemDiscount * item.quantity);
    }, 0);
    
    const deliveryFee = subtotal > 10000 ? 0 : 500; // Free delivery over LKR 10,000
    const processingFee = paymentMethod?.processingFee || 0;
    const tax = Math.round((subtotal - discount) * 0.02); // 2% tax
    const total = subtotal - discount + deliveryFee + processingFee + tax;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // 3 days delivery

    return {
      subtotal,
      discount,
      deliveryFee,
      processingFee,
      tax,
      total,
      estimatedDelivery: estimatedDelivery.toLocaleDateString(),
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
  }

  // Check product availability
  async checkProductAvailability(cartItems: CartItem[]): Promise<{ available: boolean; issues: string[] }> {
    try {
      const response = await fetch(`${this.API_BASE}/checkout/validate-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate inventory');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking product availability:', error);
      return {
        available: false,
        issues: ['Unable to verify product availability. Please try again.']
      };
    }
  }

  // Process order
  async processOrder(
    formData: CheckoutFormData,
    paymentDetails: PaymentDetails,
    cartItems: CartItem[],
    orderSummary: OrderSummary
  ): Promise<OrderConfirmation> {
    try {
      const response = await fetch(`${this.API_BASE}/checkout/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails: formData.customerDetails,
          deliveryAddress: formData.deliveryAddress,
          paymentDetails,
          cartItems,
          orderSummary,
          deliveryNotes: formData.deliveryNotes,
          deliveryTimePreference: formData.deliveryTimePreference
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing order:', error);
      throw error;
    }
  }

  // Get order details
  async getOrderDetails(orderId: string): Promise<OrderConfirmation> {
    try {
      const response = await fetch(`${this.API_BASE}/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Generate invoice URL
  generateInvoiceUrl(orderId: string): string {
    return `${this.API_BASE}/invoice/${orderId}`;
  }

  // Simulate payment processing
  async simulatePayment(paymentDetails: PaymentDetails, amount: number): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different payment outcomes
    const random = Math.random();
    
    if (paymentDetails.method.type === 'cash_on_delivery') {
      return {
        success: true,
        transactionId: `COD_${Date.now()}`
      };
    }

    if (random < 0.1) { // 10% chance of failure
      return {
        success: false,
        error: 'Payment declined. Please check your payment details and try again.'
      };
    }

    if (random < 0.05) { // 5% chance of network error
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }

    return {
      success: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  // Get checkout steps
  getCheckoutSteps(): Array<{ id: number; title: string; description: string }> {
    return [
      {
        id: 1,
        title: 'Cart Review',
        description: 'Review your selected items'
      },
      {
        id: 2,
        title: 'Shipping Details',
        description: 'Enter delivery information'
      },
      {
        id: 3,
        title: 'Payment',
        description: 'Choose payment method'
      },
      {
        id: 4,
        title: 'Confirmation',
        description: 'Order confirmation'
      }
    ];
  }

  // Estimate delivery date
  estimateDeliveryDate(deliveryTimePreference: string): string {
    const baseDate = new Date();
    let deliveryDate = new Date(baseDate);

    // Add delivery days based on preference
    switch (deliveryTimePreference) {
      case 'morning':
        deliveryDate.setDate(baseDate.getDate() + 2);
        break;
      case 'afternoon':
        deliveryDate.setDate(baseDate.getDate() + 2);
        break;
      case 'evening':
        deliveryDate.setDate(baseDate.getDate() + 2);
        break;
      default:
        deliveryDate.setDate(baseDate.getDate() + 3);
    }

    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export const checkoutService = new CheckoutService();
