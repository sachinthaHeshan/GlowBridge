'use client';

import React from 'react';
const { createContext, useContext, useState, useCallback } = React;
import { 
  CheckoutState, 
  CheckoutFormData, 
  PaymentDetails, 
  OrderConfirmation,
  OrderSummary,
  CheckoutValidationErrors,
  CheckoutStep
} from '@/types/checkout';
import { CartItem } from '@/types/cart';
import { checkoutService } from '@/services/checkoutService';

interface CheckoutContextType {
  // State
  checkoutState: CheckoutState;
  
  // Actions
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  updatePaymentDetails: (details: PaymentDetails | null) => void;
  validateCurrentStep: () => boolean;
  processOrder: (cartItems: CartItem[]) => Promise<boolean>;
  resetCheckout: () => void;
  
  // Computed
  canProceedToNextStep: boolean;
  isStepCompleted: (stepId: number) => boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const initialFormData: CheckoutFormData = {
  customerDetails: {
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: ''
  },
  deliveryAddress: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka'
  },
  useSameAsBilling: true,
  deliveryNotes: '',
  deliveryTimePreference: 'anytime'
};

const initialOrderSummary: OrderSummary = {
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  processingFee: 0,
  tax: 0,
  total: 0,
  estimatedDelivery: '',
  itemCount: 0
};

const checkoutSteps: CheckoutStep[] = [
  {
    id: 1,
    title: 'Cart Review',
    description: 'Review your selected items',
    completed: false,
    current: true
  },
  {
    id: 2,
    title: 'Shipping Details',
    description: 'Enter delivery information',
    completed: false,
    current: false
  },
  {
    id: 3,
    title: 'Payment',
    description: 'Choose payment method',
    completed: false,
    current: false
  },
  {
    id: 4,
    title: 'Confirmation',
    description: 'Order confirmation',
    completed: false,
    current: false
  }
];

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    currentStep: 1,
    steps: checkoutSteps,
    formData: initialFormData,
    paymentDetails: null,
    orderSummary: initialOrderSummary,
    validationErrors: {},
    isProcessing: false,
    orderConfirmation: null
  });

  const setCurrentStep = useCallback((step: number) => {
    setCheckoutState(prev => ({
      ...prev,
      currentStep: step,
      steps: prev.steps.map(s => ({
        ...s,
        current: s.id === step
      }))
    }));
  }, []);

  const updateFormData = useCallback((data: Partial<CheckoutFormData>) => {
    setCheckoutState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  const updatePaymentDetails = useCallback((details: PaymentDetails | null) => {
    setCheckoutState(prev => ({
      ...prev,
      paymentDetails: details
    }));
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const { currentStep, formData, paymentDetails } = checkoutState;
    const errors: CheckoutValidationErrors = {};

    switch (currentStep) {
      case 1: // Cart Review
        // Cart validation happens elsewhere
        return true;

      case 2: // Shipping Details
        const customerErrors: Partial<CheckoutFormData['customerDetails']> = {};
        const addressErrors: Partial<CheckoutFormData['deliveryAddress']> = {};

        if (!formData.customerDetails.firstName.trim()) {
          customerErrors.firstName = 'First name is required';
        }
        if (!formData.customerDetails.lastName.trim()) {
          customerErrors.lastName = 'Last name is required';
        }
        if (!formData.customerDetails.email.trim()) {
          customerErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.customerDetails.email)) {
          customerErrors.email = 'Please enter a valid email address';
        }
        if (!formData.customerDetails.contactNumber.trim()) {
          customerErrors.contactNumber = 'Contact number is required';
        }

        if (!formData.deliveryAddress.addressLine1.trim()) {
          addressErrors.addressLine1 = 'Address line 1 is required';
        }
        if (!formData.deliveryAddress.city.trim()) {
          addressErrors.city = 'City is required';
        }
        if (!formData.deliveryAddress.state.trim()) {
          addressErrors.state = 'State is required';
        }
        if (!formData.deliveryAddress.postalCode.trim()) {
          addressErrors.postalCode = 'Postal code is required';
        }

        errors.customerDetails = customerErrors;
        errors.deliveryAddress = addressErrors;
        
        const hasErrors = Object.keys(customerErrors).length > 0 || Object.keys(addressErrors).length > 0;
        
        setCheckoutState(prev => ({
          ...prev,
          validationErrors: errors
        }));
        
        return !hasErrors;

      case 3: // Payment
        const paymentErrors: Partial<PaymentDetails> = {};
        
        if (!paymentDetails) {
          errors.general = ['Please select a payment method'];
        } else if (paymentDetails.method.type === 'credit_card' || paymentDetails.method.type === 'debit_card') {
          if (!paymentDetails.cardNumber?.trim()) {
            paymentErrors.cardNumber = 'Card number is required';
          } else if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
            paymentErrors.cardNumber = 'Please enter a valid 16-digit card number';
          }
          
          if (!paymentDetails.cardHolderName?.trim()) {
            paymentErrors.cardHolderName = 'Cardholder name is required';
          }
          
          if (!paymentDetails.expiryMonth || !paymentDetails.expiryYear) {
            paymentErrors.expiryMonth = 'Expiry date is required';
          }
          
          if (!paymentDetails.cvv?.trim()) {
            paymentErrors.cvv = 'CVV is required';
          } else if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
            paymentErrors.cvv = 'Please enter a valid CVV';
          }
        }

        errors.paymentDetails = paymentErrors;
        
        const hasPaymentErrors = Object.keys(paymentErrors).length > 0 || (errors.general && errors.general.length > 0);
        
        setCheckoutState(prev => ({
          ...prev,
          validationErrors: errors
        }));
        
        return !hasPaymentErrors;

      default:
        return true;
    }
  }, [checkoutState]);

  const processOrder = useCallback(async (cartItems: CartItem[]): Promise<boolean> => {
    const { formData, paymentDetails, orderSummary } = checkoutState;
    
    if (!paymentDetails) {
      return false;
    }

    setCheckoutState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Check inventory availability
      const inventoryCheck = await checkoutService.checkProductAvailability(cartItems);
      if (!inventoryCheck.available) {
        setCheckoutState(prev => ({
          ...prev,
          isProcessing: false,
          validationErrors: {
            general: inventoryCheck.issues
          }
        }));
        return false;
      }

      // Process the order
      const orderConfirmation = await checkoutService.processOrder(
        formData,
        paymentDetails,
        cartItems,
        orderSummary
      );

      setCheckoutState(prev => ({
        ...prev,
        isProcessing: false,
        orderConfirmation,
        currentStep: 4,
        steps: prev.steps.map(s => ({
          ...s,
          completed: s.id <= 4,
          current: s.id === 4
        }))
      }));

      return true;

    } catch (error) {
      console.error('Error processing order:', error);
      
      setCheckoutState(prev => ({
        ...prev,
        isProcessing: false,
        validationErrors: {
          general: [error instanceof Error ? error.message : 'Failed to process order']
        }
      }));
      
      return false;
    }
  }, [checkoutState]);

  const resetCheckout = useCallback(() => {
    setCheckoutState({
      currentStep: 1,
      steps: checkoutSteps,
      formData: initialFormData,
      paymentDetails: null,
      orderSummary: initialOrderSummary,
      validationErrors: {},
      isProcessing: false,
      orderConfirmation: null
    });
  }, []);

  const isStepCompleted = useCallback((stepId: number): boolean => {
    return checkoutState.steps.find(s => s.id === stepId)?.completed || false;
  }, [checkoutState.steps]);

  const canProceedToNextStep = !checkoutState.isProcessing && 
    Object.keys(checkoutState.validationErrors).length === 0;

  const value: CheckoutContextType = {
    checkoutState,
    setCurrentStep,
    updateFormData,
    updatePaymentDetails,
    validateCurrentStep,
    processOrder,
    resetCheckout,
    canProceedToNextStep,
    isStepCompleted
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
