"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShoppingCart } from "@/components/shopping/ShoppingProvider";

interface PaymentFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
}

const paymentSteps: PaymentStep[] = [
  {
    id: 1,
    title: "Contact Information",
    description: "Enter your email address",
    icon: User,
  },
  {
    id: 2,
    title: "Shipping Details",
    description: "Your delivery address",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Payment Method",
    description: "Card details and confirmation",
    icon: CreditCard,
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useShoppingCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PaymentFormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [stepErrors, setStepErrors] = useState<{ [key: number]: boolean }>({});

  const taxAmount = cartTotal * 0.1;
  const finalTotal = cartTotal + taxAmount;

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    let isValid = true;

    switch (step) {
      case 1: // Contact Information
        if (!formData.email) {
          newErrors.email = "Email is required";
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
          isValid = false;
        }
        break;

      case 2: // Shipping Details
        if (!formData.firstName) {
          newErrors.firstName = "First name is required";
          isValid = false;
        }
        if (!formData.lastName) {
          newErrors.lastName = "Last name is required";
          isValid = false;
        }
        if (!formData.address) {
          newErrors.address = "Address is required";
          isValid = false;
        }
        if (!formData.city) {
          newErrors.city = "City is required";
          isValid = false;
        }
        if (!formData.postalCode) {
          newErrors.postalCode = "Postal code is required";
          isValid = false;
        }
        break;

      case 3: // Payment Method
        if (!formData.cardholderName) {
          newErrors.cardholderName = "Cardholder name is required";
          isValid = false;
        }
        if (!formData.cardNumber) {
          newErrors.cardNumber = "Card number is required";
          isValid = false;
        } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
          newErrors.cardNumber = "Card number must be 16 digits";
          isValid = false;
        }
        if (!formData.expiryDate) {
          newErrors.expiryDate = "Expiry date is required";
          isValid = false;
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
          newErrors.expiryDate = "Expiry date must be MM/YY format";
          isValid = false;
        }
        if (!formData.cvv) {
          newErrors.cvv = "CVV is required";
          isValid = false;
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
          newErrors.cvv = "CVV must be 3-4 digits";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    setStepErrors((prev) => ({ ...prev, [step]: !isValid }));
    return isValid;
  };

  const validateForm = (): boolean => {
    return validateStep(1) && validateStep(2) && validateStep(3);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const simulatePaymentGateway = async (): Promise<PaymentResult> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random success/failure for demo (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        message: "Payment processed successfully!",
      };
    } else {
      return {
        success: false,
        message:
          "Payment failed. Please check your card details and try again.",
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      nextStep();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await simulatePaymentGateway();
      setPaymentResult(result);

      if (result.success) {
        // Clear cart on successful payment
        setTimeout(() => {
          clearCart();
          router.push("/");
        }, 3000);
      }
    } catch {
      setPaymentResult({
        success: false,
        message:
          "An error occurred while processing your payment. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll send your order confirmation to this email
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                placeholder="123 Main Street, Apartment 4B"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">
                  {errors.address}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Colombo"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="00100"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  className={errors.postalCode ? "border-destructive" : ""}
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * Delivery available within Sri Lanka only
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) =>
                  handleInputChange("cardholderName", e.target.value)
                }
                className={errors.cardholderName ? "border-destructive" : ""}
              />
              {errors.cardholderName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.cardholderName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) =>
                  handleInputChange(
                    "cardNumber",
                    formatCardNumber(e.target.value)
                  )
                }
                maxLength={19}
                className={errors.cardNumber ? "border-destructive" : ""}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive mt-1">
                  {errors.cardNumber}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    handleInputChange(
                      "expiryDate",
                      formatExpiryDate(e.target.value)
                    )
                  }
                  maxLength={5}
                  className={errors.expiryDate ? "border-destructive" : ""}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) =>
                    handleInputChange("cvv", e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={4}
                  className={errors.cvv ? "border-destructive" : ""}
                />
                {errors.cvv && (
                  <p className="text-sm text-destructive mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Your payment information is encrypted and secure
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Items to Checkout
            </h2>
            <p className="text-muted-foreground mb-4">
              Your cart is empty. Add some products before proceeding to
              payment.
            </p>
            <Button onClick={() => router.push("/")}>Back to Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            {paymentResult.success ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Payment Successful!
                </h2>
                <p className="text-muted-foreground mb-4">
                  {paymentResult.message}
                </p>
                {paymentResult.transactionId && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Transaction ID: {paymentResult.transactionId}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Redirecting you back to the marketplace...
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Payment Failed
                </h2>
                <p className="text-muted-foreground mb-4">
                  {paymentResult.message}
                </p>
                <Button onClick={() => setPaymentResult(null)}>
                  Try Again
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {paymentSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const hasError = stepErrors[step.id];

                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : isActive
                                ? "border-primary text-primary bg-primary/10"
                                : hasError
                                ? "border-destructive text-destructive bg-destructive/10"
                                : "border-muted-foreground text-muted-foreground bg-muted"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <p
                              className={`text-sm font-medium ${
                                isActive
                                  ? "text-primary"
                                  : hasError
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {index < paymentSteps.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-4 ${
                              currentStep > step.id ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  {paymentSteps[currentStep - 1]?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="min-w-[140px]"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Processing...
                        </>
                      ) : currentStep === 3 ? (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        LKR {(item.price * item.quantity * 365).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground">
                      LKR {(cartTotal * 365).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="text-foreground">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%):</span>
                    <span className="text-foreground">
                      LKR {(taxAmount * 365).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-foreground">Total:</span>
                      <span className="text-primary">
                        LKR {(finalTotal * 365).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Security Notice */}
                <div className="mt-6 p-4 bg-muted/50 rounded-md">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Secure Payment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your payment information is encrypted and processed
                        securely. We accept all major credit and debit cards.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Step {currentStep} of 3</span>
                    <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
