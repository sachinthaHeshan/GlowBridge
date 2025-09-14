import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  province: string;
  zipCode: string;
  
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
  shippingProvince?: string;
  shippingZipCode?: string;
}

type PaymentStep = 'cart-review' | 'personal-info' | 'billing' | 'payment' | 'review' | 'processing' | 'success' | 'failed';

export function PaymentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PaymentStep>('cart-review');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash-on-delivery'>('card');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
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
    return `Rs.${(priceInCents / 100).toFixed(2)}`;
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
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^(?:\+94|0)?[1-9]\d{8}$/; // Sri Lankan phone number format
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return 'Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)';
    }
    return '';
  };

  const validateCardNumber = (cardNumber: string): string => {
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (!cleanCard) return 'Card number is required';
    if (cleanCard.length !== 16) {
      return 'Card number must be exactly 16 digits';
    }
    if (!/^\d+$/.test(cleanCard)) return 'Card number must contain only digits';
    return '';
  };

  const validateCVV = (cvv: string): string => {
    if (!cvv) return 'CVV is required';
    if (!/^\d{3}$/.test(cvv)) return 'CVV must be exactly 3 digits';
    return '';
  };

  const validateZipCode = (zipCode: string): string => {
    const zipRegex = /^\d{5}$/; // Sri Lankan postal codes are 5 digits
    if (!zipCode) return 'ZIP code is required';
    if (!zipRegex.test(zipCode)) return 'ZIP code must be 5 digits';
    return '';
  };

  const validateRequired = (value: string, fieldName: string): string => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return '';
  };

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 'personal-info':
        errors.firstName = validateRequired(formData.firstName, 'First name');
        errors.lastName = validateRequired(formData.lastName, 'Last name');
        errors.email = validateEmail(formData.email);
        errors.phone = validatePhone(formData.phone);
        break;
        
      case 'billing':
        errors.address = validateRequired(formData.address, 'Street address');
        errors.city = validateRequired(formData.city, 'City');
        errors.province = validateRequired(formData.province, 'Province');
        errors.zipCode = validateZipCode(formData.zipCode);
        break;
        
      case 'payment':
        if (paymentMethod === 'card') {
          errors.cardholderName = validateRequired(formData.cardholderName, 'Cardholder name');
          errors.cardNumber = validateCardNumber(formData.cardNumber);
          errors.expiryMonth = validateRequired(formData.expiryMonth, 'Expiry month');
          errors.expiryYear = validateRequired(formData.expiryYear, 'Expiry year');
          errors.cvv = validateCVV(formData.cvv);
          
          // Validate expiry date
          if (formData.expiryMonth && formData.expiryYear) {
            const currentDate = new Date();
            const expiryDate = new Date(parseInt(formData.expiryYear), parseInt(formData.expiryMonth) - 1);
            if (expiryDate < currentDate) {
              errors.expiryDate = 'Card has expired';
            }
          }
        }
        break;
    }

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== '')
    );

    setValidationErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) {
      // Validation errors are already set in validationErrors state
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

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Handle Sri Lankan phone number formatting
    if (digits.startsWith('94')) {
      // +94 format
      const formatted = digits.replace(/^94(\d{2})(\d{3})(\d{4})$/, '+94 $1 $2 $3');
      return formatted;
    } else if (digits.startsWith('0')) {
      // 0xx format
      const formatted = digits.replace(/^0(\d{2})(\d{3})(\d{4})$/, '0$1 $2 $3');
      return formatted;
    }
    
    return digits;
  };

  const generatePDFReceipt = async () => {
    try {
      // Ensure we have valid data before generating PDF
      if (!cartItems || cartItems.length === 0) {
        alert('No items found to generate receipt. Please try again.');
        return;
      }

      if (!orderNumber) {
        alert('Order number not available. Please try again.');
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(236, 72, 153); // Pink color
      pdf.text('GlowBridge', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(107, 114, 128); // Gray color
      pdf.text('Beauty Marketplace', pageWidth / 2, 35, { align: 'center' });
      
      // Receipt Title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Payment Receipt', pageWidth / 2, 55, { align: 'center' });
      
      // Order Information
      let yPosition = 75;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Information', margin, yPosition);
      
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      const orderInfo = [
        ['Order Number:', orderNumber || 'N/A'],
        ['Date:', new Date().toLocaleDateString()],
        ['Payment Method:', paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'],
        ['Total Amount:', formatPrice(calculateTotal())]
      ];
      
      orderInfo.forEach(([label, value]) => {
        pdf.text(label, margin, yPosition);
        pdf.text(value, margin + 60, yPosition);
        yPosition += 8;
      });
      
      // Customer Information
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Information', margin, yPosition);
      
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      const customerInfo = [
        ['Name:', `${formData.firstName || ''} ${formData.lastName || ''}`.trim()],
        ['Email:', formData.email || 'N/A'],
        ['Phone:', formData.phone || 'N/A']
      ];
      
      customerInfo.forEach(([label, value]) => {
        pdf.text(label, margin, yPosition);
        pdf.text(value, margin + 30, yPosition);
        yPosition += 8;
      });
      
      // Billing Address
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Billing Address', margin, yPosition);
      
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      if (formData.address) {
        pdf.text(formData.address, margin, yPosition);
        yPosition += 8;
      }
      if (formData.city || formData.province || formData.zipCode) {
        pdf.text(`${formData.city || ''}, ${formData.province || ''} ${formData.zipCode || ''}`.trim(), margin, yPosition);
        yPosition += 8;
      }
      pdf.text('Sri Lanka', margin, yPosition);
      
      // Items Section
      yPosition += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Items', margin, yPosition);
      
      yPosition += 10;
      
      // Table headers with better spacing
      pdf.setFont('helvetica', 'bold');
      pdf.text('Item', margin, yPosition);
      pdf.text('Qty', margin + 100, yPosition);
      pdf.text('Price', margin + 125, yPosition);
      pdf.text('Total', margin + 155, yPosition);
      yPosition += 5;
      
      // Table line
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Items with validation and page break handling
      pdf.setFont('helvetica', 'normal');
      const maxItemsPerPage = 12; // Maximum items before page break
      const itemHeight = 8; // Height per item row
      const summaryHeight = 80; // Estimated height needed for summary section
      const footerHeight = 30; // Height reserved for footer
      
      cartItems.forEach((item, index) => {
        if (item && item.product) {
          // Check if we need a new page
          const remainingSpace = pageHeight - yPosition - summaryHeight - footerHeight;
          if (remainingSpace < itemHeight && index < cartItems.length - 1) {
            // Add new page
            pdf.addPage();
            yPosition = 30; // Start from top of new page with some margin
            
            // Add continuation header
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text('Order Items (Continued)', margin, yPosition);
            yPosition += 15;
            
            // Repeat table headers
            pdf.setFontSize(12);
            pdf.text('Item', margin, yPosition);
            pdf.text('Qty', margin + 100, yPosition);
            pdf.text('Price', margin + 125, yPosition);
            pdf.text('Total', margin + 155, yPosition);
            yPosition += 5;
            
            // Table line
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;
            
            pdf.setFont('helvetica', 'normal');
          }
          
          const itemPrice = item.product.price || 0;
          const itemQuantity = item.quantity || 0;
          const itemTotal = itemPrice * itemQuantity;
          
          // Truncate long product names to fit
          const productName = (item.product.name || 'Unknown Product').substring(0, 40);
          
          pdf.text(productName, margin, yPosition);
          pdf.text(itemQuantity.toString(), margin + 100, yPosition);
          pdf.text(formatPrice(itemPrice), margin + 125, yPosition);
          pdf.text(formatPrice(itemTotal), margin + 155, yPosition);
          yPosition += itemHeight;
        }
      });
      
      // Check if we need a new page for summary
      const remainingSpaceForSummary = pageHeight - yPosition - footerHeight;
      if (remainingSpaceForSummary < summaryHeight) {
        pdf.addPage();
        yPosition = 30;
        
        // Add summary header on new page
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Order Summary', margin, yPosition);
        yPosition += 20;
      }
      
      // Summary section with better spacing
      yPosition += 10;
      pdf.line(margin + 100, yPosition - 5, pageWidth - margin, yPosition - 5);
      
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const shipping = calculateShipping();
      const total = calculateTotal();
      
      const summaryItems = [
        ['Subtotal:', formatPrice(subtotal)],
        ['Tax (8%):', formatPrice(tax)],
        ['Shipping:', shipping === 0 ? 'FREE' : formatPrice(shipping)],
        ['Total:', formatPrice(total)]
      ];
      
      summaryItems.forEach(([label, value], index) => {
        if (index === summaryItems.length - 1) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(12);
        }
        pdf.text(label, margin + 100, yPosition);
        pdf.text(value, margin + 155, yPosition);
        yPosition += 8;
      });
      
      // Footer
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text('Thank you for shopping with GlowBridge!', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.text('For any questions, contact us at support@glowbridge.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save(`GlowBridge-Receipt-${orderNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="payment-error-message">{error}</p>;
  };

  if (loading) {
    return (
      <div className="payment-loading-container">
        <div className="payment-loading-spinner"></div>
        <p className="payment-loading-text">Loading checkout...</p>
      </div>
    );
  }

  const renderCartReview = () => (
    <div className="payment-step-container">
      <h2 className="payment-step-title">Review Your Order</h2>
      
      <div className="payment-card">
        <h3 className="payment-card-title">Order Summary</h3>
        
        <div className="payment-cart-items">
          {cartItems.map((item) => (
            <div key={item.productId} className="payment-cart-item">
              <div className="payment-cart-item-image">
                <span className="payment-cart-item-placeholder">Product</span>
              </div>
              <div className="payment-cart-item-details">
                <h4 className="payment-cart-item-name">{item.product?.name}</h4>
                <p className="payment-cart-item-salon">by {item.product?.salon_name}</p>
                <p className="payment-cart-item-quantity">Quantity: {item.quantity}</p>
              </div>
              <div className="payment-cart-item-price">
                <p className="payment-cart-item-price-text">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="payment-order-totals">
          <div className="payment-order-total-row">
            <span>Subtotal:</span>
            <span>{formatPrice(calculateSubtotal())}</span>
          </div>
          <div className="payment-order-total-row">
            <span>Tax (8%):</span>
            <span>{formatPrice(calculateTax())}</span>
          </div>
          <div className="payment-order-total-row">
            <span>Shipping:</span>
            <span>{calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}</span>
          </div>
          <div className="payment-order-total-row payment-order-grand-total">
            <span>Total:</span>
            <span className="payment-order-grand-total-amount">{formatPrice(calculateTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="payment-step-container">
      <h2 className="payment-step-title">Personal Information</h2>
      
      <div className="payment-card">
        <div className="payment-form-grid">
          <div className="payment-form-group">
            <label className="payment-form-label">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`payment-form-input ${validationErrors.firstName ? 'error' : ''}`}
              placeholder="Enter your first name"
              required
            />
            <ErrorMessage error={validationErrors.firstName} />
          </div>
          
          <div className="payment-form-group">
            <label className="payment-form-label">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`payment-form-input ${validationErrors.lastName ? 'error' : ''}`}
              placeholder="Enter your last name"
              required
            />
            <ErrorMessage error={validationErrors.lastName} />
          </div>
          
          <div className="payment-form-group">
            <label className="payment-form-label">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`payment-form-input ${validationErrors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              required
            />
            <ErrorMessage error={validationErrors.email} />
          </div>
          
          <div className="payment-form-group">
            <label className="payment-form-label">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
              className={`payment-form-input ${validationErrors.phone ? 'error' : ''}`}
              placeholder="Enter your phone number (e.g., 0771234567)"
              required
            />
            <ErrorMessage error={validationErrors.phone} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="payment-step-container">
      <h2 className="payment-step-title">Billing Address</h2>
      
      <div className="payment-card">
        <div className="payment-form-fields">
          <div className="payment-form-group">
            <label className="payment-form-label">Street Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`payment-form-input ${validationErrors.address ? 'error' : ''}`}
              placeholder="Enter your street address"
              required
            />
            <ErrorMessage error={validationErrors.address} />
          </div>
          
          <div className="payment-form-grid">
            <div className="payment-form-group">
              <label className="payment-form-label">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`payment-form-input ${validationErrors.city ? 'error' : ''}`}
                placeholder="Enter your city"
                required
              />
              <ErrorMessage error={validationErrors.city} />
            </div>
            
            <div className="payment-form-group">
              <label className="payment-form-label">Province *</label>
              <select
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className={`payment-form-select ${validationErrors.province ? 'error' : ''}`}
                required
              >
                <option value="">Select your province</option>
                <option value="Western">Western Province</option>
                <option value="Central">Central Province</option>
                <option value="Southern">Southern Province</option>
                <option value="Northern">Northern Province</option>
                <option value="Eastern">Eastern Province</option>
                <option value="North Western">North Western Province</option>
                <option value="North Central">North Central Province</option>
                <option value="Uva">Uva Province</option>
                <option value="Sabaragamuwa">Sabaragamuwa Province</option>
              </select>
              <ErrorMessage error={validationErrors.province} />
            </div>
          </div>
          
          <div className="payment-form-group">
            <label className="payment-form-label">ZIP Code *</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
              className={`payment-form-input ${validationErrors.zipCode ? 'error' : ''}`}
              placeholder="Enter your ZIP code (5 digits)"
              maxLength={5}
              required
            />
            <ErrorMessage error={validationErrors.zipCode} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="payment-step-container">
      <h2 className="payment-step-title">Payment Information</h2>
      
      {/* Payment Method Selection */}
      <div className="payment-card">
        <h3 className="payment-card-title">Select Payment Method</h3>
        
        <div className="payment-method-grid">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`payment-method-button ${paymentMethod === 'card' ? 'selected' : ''}`}
          >
            <div className="payment-method-content">
              <div className="payment-method-icon">CARD</div>
              <div className="payment-method-label">Credit Card</div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('cash-on-delivery')}
            className={`payment-method-button ${paymentMethod === 'cash-on-delivery' ? 'selected' : ''}`}
          >
            <div className="payment-method-content">
              <div className="payment-method-icon">CASH</div>
              <div className="payment-method-label">Cash on Delivery</div>
            </div>
          </button>
        </div>

        {/* Credit Card Form */}
        {paymentMethod === 'card' && (
          <div className="payment-form-fields">
            <div className="payment-form-group">
              <label className="payment-form-label">Cardholder Name *</label>
              <input
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className={`payment-form-input ${validationErrors.cardholderName ? 'error' : ''}`}
                placeholder="Enter cardholder name"
                required
              />
              <ErrorMessage error={validationErrors.cardholderName} />
            </div>
            
            <div className="payment-form-group">
              <label className="payment-form-label">Card Number *</label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                className={`payment-form-input ${validationErrors.cardNumber ? 'error' : ''}`}
                placeholder="XXXX XXXX XXXX XXXX"
                maxLength={19}
                required
              />
              <ErrorMessage error={validationErrors.cardNumber} />
            </div>
            
            <div className="payment-form-grid-cols-3">
              <div className="payment-form-group">
                <label className="payment-form-label">Month *</label>
                <select
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  className={`payment-form-select ${validationErrors.expiryMonth ? 'error' : ''}`}
                  required
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={validationErrors.expiryMonth} />
              </div>
              
              <div className="payment-form-group">
                <label className="payment-form-label">Year *</label>
                <select
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  className={`payment-form-select ${validationErrors.expiryYear ? 'error' : ''}`}
                  required
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={2025 + i} value={String(2025 + i)}>
                      {2025 + i}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={validationErrors.expiryYear} />
              </div>
              
              <div className="payment-form-group">
                <label className="payment-form-label">CVV *</label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={`payment-form-input ${validationErrors.cvv ? 'error' : ''}`}
                  placeholder="XXX"
                  maxLength={3}
                  required
                />
                <ErrorMessage error={validationErrors.cvv} />
              </div>
            </div>
            {validationErrors.expiryDate && (
              <ErrorMessage error={validationErrors.expiryDate} />
            )}
          </div>
        )}

        {paymentMethod === 'cash-on-delivery' && (
          <div className="payment-cash-delivery">
            <div className="payment-cash-delivery-title">Cash on Delivery</div>
            <div className="payment-cash-delivery-info">
              <h4 className="payment-cash-delivery-info-title">Payment Instructions:</h4>
              <ul className="payment-cash-delivery-list">
                <li>• Payment will be collected upon delivery</li>
                <li>• Please have the exact amount ready</li>
                <li>• Our delivery agent will provide a receipt</li>
                <li>• Delivery charges may apply based on location</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="payment-step-container">
      <h2 className="payment-step-title">Review & Confirm</h2>
      
      <div className="payment-review-grid">
        {/* Order Summary */}
        <div className="payment-card">
          <h3 className="payment-card-title">Order Summary</h3>
          <div className="payment-review-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="payment-review-item">
                <span className="payment-review-item-name">{item.product?.name} x{item.quantity}</span>
                <span className="payment-review-item-price">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
            <div className="payment-review-totals">
              <div className="payment-review-total-row">
                <span>Subtotal:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="payment-review-total-row">
                <span>Tax:</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              <div className="payment-review-total-row">
                <span>Shipping:</span>
                <span>{calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}</span>
              </div>
              <div className="payment-review-total-row payment-review-grand-total">
                <span>Total:</span>
                <span className="payment-review-grand-total-amount">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="payment-review-info">
          <div className="payment-card">
            <h3 className="payment-card-title">Customer Information</h3>
            <div className="payment-review-info-content">
              <p><span className="payment-review-info-label">Name:</span> {formData.firstName} {formData.lastName}</p>
              <p><span className="payment-review-info-label">Email:</span> {formData.email}</p>
              <p><span className="payment-review-info-label">Phone:</span> {formData.phone}</p>
            </div>
          </div>

          <div className="payment-card">
            <h3 className="payment-card-title">Billing Address</h3>
            <div className="payment-review-address">
              <p>{formData.address}</p>
              <p>{formData.city}, {formData.province} {formData.zipCode}</p>
              <p>Sri Lanka</p>
            </div>
          </div>

          <div className="payment-card">
            <h3 className="payment-card-title">Payment Method</h3>
            <div className="payment-review-payment">
              {paymentMethod === 'card' && (
                <p>Credit Card ending in {formData.cardNumber.slice(-4)}</p>
              )}
              {paymentMethod === 'cash-on-delivery' && <p>Cash on Delivery</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="payment-processing-container">
      <div className="payment-processing-spinner"></div>
      <h2 className="payment-processing-title">Processing Your Payment</h2>
      <p className="payment-processing-subtitle">Please do not close this window or refresh the page.</p>
      
      <div className="payment-processing-card">
        <div className="payment-processing-steps">
          <div className="payment-processing-step">
            <div className="payment-processing-step-icon completed"></div>
            <span className="payment-processing-step-text">Validating payment information</span>
          </div>
          <div className="payment-processing-step">
            <div className="payment-processing-step-icon completed"></div>
            <span className="payment-processing-step-text">Contacting payment processor</span>
          </div>
          <div className="payment-processing-step">
            <div className="payment-processing-step-icon active"></div>
            <span className="payment-processing-step-text">Authorizing payment...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="payment-success-container">
      <div className="payment-success-icon"></div>
      <h2 className="payment-success-title">Payment Successful!</h2>
      <p className="payment-success-subtitle">Thank you for your order. Your payment has been processed successfully.</p>
      
      <div className="payment-success-card">
        <h3 className="payment-success-card-title">Order Details</h3>
        <div className="payment-success-details">
          <div className="payment-success-detail-row">
            <span>Order Number:</span>
            <span className="payment-success-order-number">{orderNumber}</span>
          </div>
          <div className="payment-success-detail-row">
            <span>Total Amount:</span>
            <span className="payment-success-total-amount">{formatPrice(calculateTotal())}</span>
          </div>
          <div className="payment-success-detail-row">
            <span>Payment Method:</span>
            <span className="payment-success-payment-method">{paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : paymentMethod}</span>
          </div>
          <div className="payment-success-detail-row">
            <span>Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="payment-success-actions">
        <p className="payment-success-email-notice">A confirmation email has been sent to {formData.email}</p>
        <div className="payment-success-button-container">
          <button
            onClick={generatePDFReceipt}
            className="payment-success-pdf-button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF Receipt
          </button>
          <button
            onClick={() => router.push('/')}
            className="payment-success-continue-button"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );

  const renderFailed = () => (
    <div className="payment-failed-container">
      <div className="payment-failed-icon"></div>
      <h2 className="payment-failed-title">Payment Failed</h2>
      <p className="payment-failed-subtitle">We encountered an issue processing your payment. Please try again.</p>
      
      <div className="payment-failed-card">
        <h3 className="payment-failed-card-title">What went wrong?</h3>
        <ul className="payment-failed-reasons">
          <li>• Your card may have been declined</li>
          <li>• Insufficient funds</li>
          <li>• Expired card</li>
          <li>• Incorrect payment information</li>
          <li>• Network connectivity issues</li>
        </ul>
      </div>

      <div className="payment-failed-actions">
        <button
          onClick={() => setCurrentStep('payment')}
          className="payment-failed-try-again-button"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="payment-failed-back-button"
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
    <div className="payment-page-container">
      {/* Header */}
      <header className="payment-header">
        <div className="payment-header-content">
          <div className="payment-header-left">
            <button
              onClick={() => router.push('/')}
              className="payment-back-button"
            >
              ← Back to Shop
            </button>
            <h1 className="payment-header-title">
              Secure Checkout
            </h1>
          </div>
          {isNormalStep && (
            <div className="payment-step-indicator">
              Step {getStepNumber()} of 5
            </div>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      {isNormalStep && (
        <div className="payment-progress-container">
          <div className="payment-progress-content">
            <div className="payment-progress-steps">
              {['Cart', 'Personal', 'Billing', 'Payment', 'Review'].map((step, index) => {
                const stepNumber = index + 1;
                const isActive = getStepNumber() === stepNumber;
                const isCompleted = getStepNumber() > stepNumber;
                
                return (
                  <div key={step} className="payment-progress-step">
                    <div className={`payment-progress-step-circle ${isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}`}>
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    <span className={`payment-progress-step-label ${isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}`}>
                      {step}
                    </span>
                    {index < 4 && (
                      <div className={`payment-progress-step-line ${isCompleted ? 'completed' : 'inactive'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="payment-main-content">
        {getStepContent()}

        {/* Navigation Buttons */}
        {isNormalStep && (
          <div className="payment-navigation-buttons">
            <button
              onClick={currentStep === 'cart-review' ? () => router.push('/') : prevStep}
              className="payment-nav-button-secondary"
            >
              {currentStep === 'cart-review' ? 'Back to Shop' : 'Previous'}
            </button>
            
            <button
              onClick={currentStep === 'review' ? simulatePaymentProcessing : nextStep}
              className="payment-nav-button-primary"
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
