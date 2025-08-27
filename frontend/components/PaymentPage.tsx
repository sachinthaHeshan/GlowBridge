import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  salon_name: string;
  discount?: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface PaymentFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Billing Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Payment Information
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  
  // Shipping
  sameAsBilling: boolean;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
}

type PaymentStep = 'cart-review' | 'personal-info' | 'billing' | 'payment' | 'review' | 'processing' | 'success' | 'failed';

export function PaymentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PaymentStep>('cart-review');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple-pay'>('card');
  const [orderNumber, setOrderNumber] = useState<string>('');
  
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    sameAsBilling: true
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/cart`);
      if (response.ok) {
        const cartData = await response.json();
        const transformedCart = cartData.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          product: item.product
        }));
        setCartItems(transformedCart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.08); // 8% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 5000 ? 0 : 999; // Free shipping over $50
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'personal-info':
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 'billing':
        return !!(formData.address && formData.city && formData.state && formData.zipCode);
      case 'payment':
        if (paymentMethod === 'card') {
          return !!(formData.cardNumber && formData.expiryMonth && formData.expiryYear && formData.cvv && formData.cardholderName);
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) {
      // You can replace this with a toast notification or inline error display
      return;
    }

    const steps: PaymentStep[] = ['cart-review', 'personal-info', 'billing', 'payment', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: PaymentStep[] = ['cart-review', 'personal-info', 'billing', 'payment', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const simulatePaymentProcessing = async () => {
    setCurrentStep('processing');
    setProcessing(true);

    // Generate order number
    const orderNum = `GLB-${Date.now().toString().slice(-8)}`;
    setOrderNumber(orderNum);

    // Simulate payment gateway steps
    const steps = [
      { message: 'Validating payment information...', duration: 1500 },
      { message: 'Contacting payment processor...', duration: 2000 },
      { message: 'Authorizing payment...', duration: 1800 },
      { message: 'Processing transaction...', duration: 2200 },
      { message: 'Updating inventory...', duration: 1000 },
      { message: 'Generating receipt...', duration: 800 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      // Clear cart on success
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/cart`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
      setCurrentStep('success');
    } else {
      setCurrentStep('failed');
    }
    
    setProcessing(false);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const renderCartReview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-poppins text-gray-800">Review Your Order</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-300 rounded-lg flex items-center justify-center">
                <span className="text-2xl">Product</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{item.product?.name}</h4>
                <p className="text-gray-600 text-sm">by {item.product?.salon_name}</p>
                <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-pink-600">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatPrice(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8%):</span>
            <span>{formatPrice(calculateTax())}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-pink-600">{formatPrice(calculateTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-poppins text-gray-800">Personal Information</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your last name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-poppins text-gray-800">Billing Address</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your street address"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your city"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your state"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your ZIP code"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-poppins text-gray-800">Payment Information</h2>
      
      {/* Payment Method Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border-2 rounded-lg transition-all ${
              paymentMethod === 'card' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">CARD</div>
              <div className="font-medium">Credit Card</div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 border-2 rounded-lg transition-all ${
              paymentMethod === 'paypal' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">PAY</div>
              <div className="font-medium">PayPal</div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('apple-pay')}
            className={`p-4 border-2 rounded-lg transition-all ${
              paymentMethod === 'apple-pay' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">APPLE</div>
              <div className="font-medium">Apple Pay</div>
            </div>
          </button>
        </div>

        {/* Credit Card Form */}
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
              <input
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter cardholder name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                <select
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <select
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={2025 + i} value={String(2025 + i)}>
                      {2025 + i}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">PayPal</div>
            <p className="text-gray-600">You will be redirected to PayPal to complete your payment.</p>
          </div>
        )}

        {paymentMethod === 'apple-pay' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">Apple Pay</div>
            <p className="text-gray-600">Use Touch ID or Face ID to pay with Apple Pay.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-poppins text-gray-800">Review & Confirm</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span className="text-gray-600">{item.product?.name} x{item.quantity}</span>
                <span className="font-medium">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-pink-600">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
            <div className="text-sm text-gray-600">
              <p>{formData.address}</p>
              <p>{formData.city}, {formData.state} {formData.zipCode}</p>
              <p>{formData.country}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="text-sm text-gray-600">
              {paymentMethod === 'card' && (
                <p>Credit Card ending in {formData.cardNumber.slice(-4)}</p>
              )}
              {paymentMethod === 'paypal' && <p>PayPal</p>}
              {paymentMethod === 'apple-pay' && <p>Apple Pay</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-16">
      <div className="animate-spin rounded-full h-20 w-20 border-4 border-pink-500 border-t-transparent mx-auto mb-8"></div>
      <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-4">Processing Your Payment</h2>
      <p className="text-gray-600 mb-8">Please do not close this window or refresh the page.</p>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm">Validating payment information</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm">Contacting payment processor</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-pink-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Authorizing payment...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-white text-2xl">✓</span>
      </div>
      <h2 className="text-3xl font-bold font-poppins text-green-600 mb-4">Payment Successful!</h2>
      <p className="text-gray-600 mb-8">Thank you for your order. Your payment has been processed successfully.</p>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Order Number:</span>
            <span className="font-mono font-bold text-pink-600">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold">{formatPrice(calculateTotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="capitalize">{paymentMethod === 'card' ? 'Credit Card' : paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-500">A confirmation email has been sent to {formData.email}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  const renderFailed = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-white text-2xl">✕</span>
      </div>
      <h2 className="text-3xl font-bold font-poppins text-red-600 mb-4">Payment Failed</h2>
      <p className="text-gray-600 mb-8">We encountered an issue processing your payment. Please try again.</p>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">What went wrong?</h3>
        <ul className="text-sm text-gray-600 space-y-2 text-left">
          <li>• Your card may have been declined</li>
          <li>• Insufficient funds</li>
          <li>• Expired card</li>
          <li>• Incorrect payment information</li>
          <li>• Network connectivity issues</li>
        </ul>
      </div>

      <div className="space-x-4">
        <button
          onClick={() => setCurrentStep('payment')}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="bg-gray-500 text-white px-8 py-3 rounded-full hover:bg-gray-600 transition-all duration-300 font-semibold"
        >
          Back to Shop
        </button>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 'cart-review': return renderCartReview();
      case 'personal-info': return renderPersonalInfo();
      case 'billing': return renderBilling();
      case 'payment': return renderPayment();
      case 'review': return renderReview();
      case 'processing': return renderProcessing();
      case 'success': return renderSuccess();
      case 'failed': return renderFailed();
      default: return renderCartReview();
    }
  };

  const getStepNumber = () => {
    const steps = ['cart-review', 'personal-info', 'billing', 'payment', 'review'];
    return steps.indexOf(currentStep) + 1;
  };

  const isNormalStep = !['processing', 'success', 'failed'].includes(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 font-nunito">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-pink-500 hover:text-pink-600 mr-4"
              >
                ← Back to Shop
              </button>
              <h1 className="text-3xl font-bold font-poppins bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Secure Checkout
              </h1>
            </div>
            {isNormalStep && (
              <div className="text-sm text-gray-600">
                Step {getStepNumber()} of 5
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {isNormalStep && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {['Cart', 'Personal', 'Billing', 'Payment', 'Review'].map((step, index) => {
                const stepNumber = index + 1;
                const isActive = getStepNumber() === stepNumber;
                const isCompleted = getStepNumber() > stepNumber;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? 'DONE' : stepNumber}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                    {index < 4 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getStepContent()}

        {/* Navigation Buttons */}
        {isNormalStep && (
          <div className="flex justify-between mt-8">
            <button
              onClick={currentStep === 'cart-review' ? () => router.push('/') : prevStep}
              className="bg-gray-500 text-white px-8 py-3 rounded-full hover:bg-gray-600 transition-all duration-300 font-semibold"
            >
              {currentStep === 'cart-review' ? 'Back to Shop' : 'Previous'}
            </button>
            
            <button
              onClick={currentStep === 'review' ? simulatePaymentProcessing : nextStep}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
              disabled={processing}
            >
              {currentStep === 'review' ? 'Complete Payment' : 'Continue'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
