'use client';

import React from 'react';
import { CheckoutFormData, CheckoutValidationErrors } from '@/types/checkout';

interface ShippingDetailsFormProps {
  formData: CheckoutFormData;
  validationErrors: CheckoutValidationErrors;
  onUpdateFormData: (data: Partial<CheckoutFormData>) => void;
}

export function ShippingDetailsForm({
  formData,
  validationErrors,
  onUpdateFormData
}: ShippingDetailsFormProps) {
  const updateCustomerDetails = (field: keyof CheckoutFormData['customerDetails'], value: string) => {
    onUpdateFormData({
      customerDetails: {
        ...formData.customerDetails,
        [field]: value
      }
    });
  };

  const updateDeliveryAddress = (field: keyof CheckoutFormData['deliveryAddress'], value: string) => {
    onUpdateFormData({
      deliveryAddress: {
        ...formData.deliveryAddress,
        [field]: value
      }
    });
  };

  const updateDeliveryPreference = (preference: CheckoutFormData['deliveryTimePreference']) => {
    onUpdateFormData({
      deliveryTimePreference: preference
    });
  };

  return (
    <div className="space-y-8">
      {/* Customer Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.customerDetails.firstName}
              onChange={(e) => updateCustomerDetails('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.customerDetails?.firstName 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {validationErrors.customerDetails?.firstName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.customerDetails.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.customerDetails.lastName}
              onChange={(e) => updateCustomerDetails('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.customerDetails?.lastName 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {validationErrors.customerDetails?.lastName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.customerDetails.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.customerDetails.email}
              onChange={(e) => updateCustomerDetails('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.customerDetails?.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {validationErrors.customerDetails?.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.customerDetails.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <input
              type="tel"
              value={formData.customerDetails.contactNumber}
              onChange={(e) => updateCustomerDetails('contactNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.customerDetails?.contactNumber 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter your contact number"
            />
            {validationErrors.customerDetails?.contactNumber && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.customerDetails.contactNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={formData.deliveryAddress.addressLine1}
              onChange={(e) => updateDeliveryAddress('addressLine1', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.deliveryAddress?.addressLine1 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Street address, P.O. box, building name, etc."
            />
            {validationErrors.deliveryAddress?.addressLine1 && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.deliveryAddress.addressLine1}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.deliveryAddress.addressLine2 || ''}
              onChange={(e) => updateDeliveryAddress('addressLine2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apartment, suite, unit, floor, etc. (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.deliveryAddress.city}
                onChange={(e) => updateDeliveryAddress('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.deliveryAddress?.city 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="City"
              />
              {validationErrors.deliveryAddress?.city && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.deliveryAddress.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province *
              </label>
              <select
                value={formData.deliveryAddress.state}
                onChange={(e) => updateDeliveryAddress('state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.deliveryAddress?.state 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
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
              {validationErrors.deliveryAddress?.state && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.deliveryAddress.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                value={formData.deliveryAddress.postalCode}
                onChange={(e) => updateDeliveryAddress('postalCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.deliveryAddress?.postalCode 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Postal Code"
              />
              {validationErrors.deliveryAddress?.postalCode && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.deliveryAddress.postalCode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.deliveryAddress.country}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Delivery Options Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Delivery Time
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'morning', label: 'Morning (9AM - 12PM)' },
                { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
                { value: 'evening', label: 'Evening (5PM - 8PM)' },
                { value: 'anytime', label: 'Anytime' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryTime"
                    value={option.value}
                    checked={formData.deliveryTimePreference === option.value}
                    onChange={(e) => updateDeliveryPreference(e.target.value as CheckoutFormData['deliveryTimePreference'])}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Notes (Optional)
            </label>
            <textarea
              value={formData.deliveryNotes || ''}
              onChange={(e) => onUpdateFormData({ deliveryNotes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Special instructions for delivery (e.g., gate code, preferred location, etc.)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
