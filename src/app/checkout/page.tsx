'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/price';
import { AppLayout } from '@/components/AppLayout';
import { LoadingSpinner, EmptyState } from '@/components/common/UIComponents';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
}

interface DeliveryAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  processingFee: number;
}

const initialSteps: CheckoutStep[] = [
  { id: 1, title: 'Cart Review', description: 'Review your items', completed: false, current: true },
  { id: 2, title: 'Shipping Details', description: 'Enter delivery info', completed: false, current: false },
  { id: 3, title: 'Payment', description: 'Choose payment method', completed: false, current: false },
  { id: 4, title: 'Confirmation', description: 'Order confirmation', completed: false, current: false }
];

const paymentMethods: PaymentMethod[] = [
  { id: 'credit_card', type: 'credit_card', name: 'Credit Card', description: 'Visa, MasterCard, American Express', icon: '💳', processingFee: 0 },
  { id: 'cash_on_delivery', type: 'cash_on_delivery', name: 'Cash on Delivery', description: 'Pay when you receive', icon: '💵', processingFee: 5 }
];

function CheckoutPageContent() {
  const { cart, totals, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(initialSteps);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<any>(null);
  
  // Form state
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: ''
  });
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka'
  });
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  if (cart.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading checkout..." />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0 && currentStep < 4) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Your cart is empty"
            description="Add some items to your cart before checking out."
            actionLabel="Start Shopping"
            onAction={() => window.location.href = '/'}
          />
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < 4) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setSteps(steps.map(step => ({
        ...step,
        completed: step.id < newStep,
        current: step.id === newStep
      })));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setSteps(steps.map(step => ({
        ...step,
        completed: step.id < newStep,
        current: step.id === newStep
      })));
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 2: // Shipping Details
        return customerDetails.firstName && customerDetails.lastName && 
               customerDetails.email && customerDetails.contactNumber &&
               deliveryAddress.addressLine1 && deliveryAddress.city &&
               deliveryAddress.state && deliveryAddress.postalCode;
      case 3: // Payment
        if (!selectedPayment) return false;
        if (selectedPayment.type === 'credit_card') {
          return cardDetails.cardNumber && cardDetails.cardHolderName &&
                 cardDetails.expiryMonth && cardDetails.expiryYear && cardDetails.cvv;
        }
        return true;
      default:
        return true;
    }
  };

  const processOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order confirmation
      const confirmation = {
        orderId: `ORD-${Date.now()}`,
        orderNumber: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'confirmed',
        paymentStatus: selectedPayment?.type === 'cash_on_delivery' ? 'pending' : 'completed',
        total: totals.finalTotal,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        items: cart.items.map(item => ({
          name: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.product?.price || 0
        }))
      };
      
      setOrderConfirmation(confirmation);
      
      // Clear cart and move to confirmation step
      await clearCart();
      handleNext();
      
    } catch (error) {
      console.error('Order processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const deliveryFee = totals.subtotal > 10000 ? 0 : 500;
  const processingFee = selectedPayment?.processingFee || 0;
  const tax = Math.round((totals.subtotal - totals.totalDiscount) * 0.02);
  const finalTotal = totals.subtotal - totals.totalDiscount + deliveryFee + processingFee + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        {/* Progress Steps */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    step.completed ? 'bg-green-500 border-green-500 text-white' : 
                    step.current ? 'bg-blue-500 border-blue-500 text-white' : 
                    'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? '✓' : step.id}
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className={`text-sm font-medium ${step.current || step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${step.current || step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    steps[index + 1].current || steps[index + 1].completed || step.completed ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              
              {/* Step 1: Cart Review */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg"></div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice((item.product?.price || 0) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Details */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                  <div className="space-y-6">
                    {/* Customer Details */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                          <input
                            type="text"
                            value={customerDetails.firstName}
                            onChange={(e) => setCustomerDetails({...customerDetails, firstName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                          <input
                            type="text"
                            value={customerDetails.lastName}
                            onChange={(e) => setCustomerDetails({...customerDetails, lastName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <input
                            type="email"
                            value={customerDetails.email}
                            onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                          <input
                            type="tel"
                            value={customerDetails.contactNumber}
                            onChange={(e) => setCustomerDetails({...customerDetails, contactNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your contact number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Delivery Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                          <input
                            type="text"
                            value={deliveryAddress.addressLine1}
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine1: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Street address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                          <input
                            type="text"
                            value={deliveryAddress.addressLine2}
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine2: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input
                              type="text"
                              value={deliveryAddress.city}
                              onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                            <select
                              value={deliveryAddress.state}
                              onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Province</option>
                              <option value="Western Province">Western Province</option>
                              <option value="Central Province">Central Province</option>
                              <option value="Southern Province">Southern Province</option>
                              <option value="Northern Province">Northern Province</option>
                              <option value="Eastern Province">Eastern Province</option>
                              <option value="North Western Province">North Western Province</option>
                              <option value="North Central Province">North Central Province</option>
                              <option value="Uva Province">Uva Province</option>
                              <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                            <input
                              type="text"
                              value={deliveryAddress.postalCode}
                              onChange={(e) => setDeliveryAddress({...deliveryAddress, postalCode: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Postal Code"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPayment?.id === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPayment(method)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{method.icon}</div>
                            <div>
                              <h4 className="font-medium text-gray-900">{method.name}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                              {method.processingFee > 0 && (
                                <p className="text-xs text-orange-600">Processing fee: LKR {method.processingFee}</p>
                              )}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPayment?.id === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedPayment?.id === method.id && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Card Details */}
                    {selectedPayment?.type === 'credit_card' && (
                      <div className="border border-gray-200 rounded-lg p-4 mt-4">
                        <h3 className="text-lg font-medium mb-3">Card Details</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                            <input
                              type="text"
                              value={cardDetails.cardNumber}
                              onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                            <input
                              type="text"
                              value={cardDetails.cardHolderName}
                              onChange={(e) => setCardDetails({...cardDetails, cardHolderName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Name as on card"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                              <select
                                value={cardDetails.expiryMonth}
                                onChange={(e) => setCardDetails({...cardDetails, expiryMonth: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">MM</option>
                                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                  <option key={month} value={month.toString().padStart(2, '0')}>
                                    {month.toString().padStart(2, '0')}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                              <select
                                value={cardDetails.expiryYear}
                                onChange={(e) => setCardDetails({...cardDetails, expiryYear: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">YYYY</option>
                                {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                                  <option key={year} value={year.toString()}>{year}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                              <input
                                type="text"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="123"
                                maxLength={4}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && orderConfirmation && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-600">Thank you for your purchase. Your order has been placed successfully.</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">{orderConfirmation.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium capitalize">{orderConfirmation.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium capitalize ${
                        orderConfirmation.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {orderConfirmation.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">{orderConfirmation.estimatedDelivery}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-4">
                      <span>Total:</span>
                      <span>{formatPrice(orderConfirmation.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || currentStep === 4}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentStep === 1 || currentStep === 4
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  ← Previous
                </button>

                <div className="text-sm text-gray-500">Step {currentStep} of 4</div>

                {currentStep === 4 ? (
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Continue Shopping →
                  </button>
                ) : currentStep === 3 ? (
                  <button
                    onClick={processOrder}
                    disabled={!validateStep() || isProcessing}
                    className={`flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      !validateStep() || isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'} →
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!validateStep()}
                    className={`flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      !validateStep()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totals.itemCount} items):</span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>

                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-{formatPrice(totals.totalDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>

                {processingFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-medium">{formatPrice(processingFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (2%):</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {deliveryFee === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">Free Delivery!</span>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center mb-1">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </div>
                <p>Your information is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AppLayout>
      <CheckoutPageContent />
    </AppLayout>
  );
}
