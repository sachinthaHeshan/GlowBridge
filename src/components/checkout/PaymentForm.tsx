'use client';

import React from 'react';
import { PaymentDetails, PaymentMethod, CheckoutValidationErrors } from '@/types/checkout';
import { checkoutService } from '@/services/checkoutService';

interface PaymentFormProps {
  paymentDetails: PaymentDetails | null;
  validationErrors: CheckoutValidationErrors;
  onUpdatePaymentDetails: (details: PaymentDetails | null) => void;
}

export function PaymentForm({
  paymentDetails,
  validationErrors,
  onUpdatePaymentDetails
}: PaymentFormProps) {
  const paymentMethods = checkoutService.getPaymentMethods();
  
  const selectPaymentMethod = (method: PaymentMethod) => {
    onUpdatePaymentDetails({
      method,
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: false
    });
  };

  const updatePaymentField = (field: keyof PaymentDetails, value: string | boolean) => {
    if (!paymentDetails) return;
    
    onUpdatePaymentDetails({
      ...paymentDetails,
      [field]: value
    });
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (e: any) => {
    const formatted = formatCardNumber(e.target.value);
    updatePaymentField('cardNumber', formatted);
  };

  const handleCvvChange = (e: any) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    updatePaymentField('cvv', digitsOnly.substring(0, 4));
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentDetails?.method.id === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => selectPaymentMethod(method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{method.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    {method.processingFee > 0 && (
                      <p className="text-xs text-orange-600">
                        Processing fee: LKR {method.processingFee}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  paymentDetails?.method.id === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {paymentDetails?.method.id === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {validationErrors.general && validationErrors.general.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            {validationErrors.general.map((error, index) => (
              <p key={index} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}
      </div>

      {/* Card Details Form */}
      {paymentDetails && 
       (paymentDetails.method.type === 'credit_card' || paymentDetails.method.type === 'debit_card') && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                value={paymentDetails.cardNumber || ''}
                onChange={handleCardNumberChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.paymentDetails?.cardNumber
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {validationErrors.paymentDetails?.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.paymentDetails.cardNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name *
              </label>
              <input
                type="text"
                value={paymentDetails.cardHolderName || ''}
                onChange={(e) => updatePaymentField('cardHolderName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.paymentDetails?.cardHolderName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Name as it appears on card"
              />
              {validationErrors.paymentDetails?.cardHolderName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.paymentDetails.cardHolderName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={paymentDetails.expiryMonth || ''}
                    onChange={(e) => updatePaymentField('expiryMonth', e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.paymentDetails?.expiryMonth
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={paymentDetails.expiryYear || ''}
                    onChange={(e) => updatePaymentField('expiryYear', e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.paymentDetails?.expiryMonth
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.paymentDetails?.expiryMonth && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.paymentDetails.expiryMonth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  value={paymentDetails.cvv || ''}
                  onChange={handleCvvChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.paymentDetails?.cvv
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="123"
                  maxLength={4}
                />
                {validationErrors.paymentDetails?.cvv && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.paymentDetails.cvv}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="save-card"
                type="checkbox"
                checked={paymentDetails.saveCard || false}
                onChange={(e) => updatePaymentField('saveCard', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="save-card" className="ml-2 block text-sm text-gray-700">
                Save this card for future purchases
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Cash on Delivery Info */}
      {paymentDetails && paymentDetails.method.type === 'cash_on_delivery' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Cash on Delivery</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You'll pay in cash when your order is delivered. Please have the exact amount ready.
                A processing fee of LKR {paymentDetails.method.processingFee} will be added to your total.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Info */}
      {paymentDetails && paymentDetails.method.type === 'bank_transfer' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Bank Transfer</h4>
              <p className="text-sm text-blue-700 mt-1">
                After placing your order, you'll receive bank details via email to complete the payment.
                Your order will be processed once payment is confirmed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-gray-600 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Secure Payment:</span> Your payment information is encrypted and secure. 
              We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
