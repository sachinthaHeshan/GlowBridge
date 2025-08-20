export interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
}

export interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface CheckoutFormData {
  customerDetails: CustomerDetails;
  deliveryAddress: DeliveryAddress;
  billingAddress?: DeliveryAddress;
  useSameAsBilling: boolean;
  deliveryNotes?: string;
  deliveryTimePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  name: string;
  description: string;
  icon: string;
  processingFee?: number;
  isAvailable: boolean;
}

export interface PaymentDetails {
  method: PaymentMethod;
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  saveCard?: boolean;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  processingFee: number;
  tax: number;
  total: number;
  estimatedDelivery: string;
  itemCount: number;
}

export interface CheckoutValidationErrors {
  customerDetails?: Partial<CustomerDetails>;
  deliveryAddress?: Partial<DeliveryAddress>;
  paymentDetails?: Partial<PaymentDetails>;
  general?: string[];
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  invoiceUrl?: string;
  customerDetails: CustomerDetails;
  deliveryAddress: DeliveryAddress;
  orderSummary: OrderSummary;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  salonName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface CheckoutState {
  currentStep: number;
  steps: CheckoutStep[];
  formData: CheckoutFormData;
  paymentDetails: PaymentDetails | null;
  orderSummary: OrderSummary;
  validationErrors: CheckoutValidationErrors;
  isProcessing: boolean;
  orderConfirmation: OrderConfirmation | null;
}
