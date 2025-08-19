'use client';

import React from 'react';
import { CheckoutStep } from '@/types/checkout';

interface CheckoutStepProgressProps {
  steps: CheckoutStep[];
  currentStep: number;
}

export function CheckoutStepProgress({ steps, currentStep }: CheckoutStepProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                ${step.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.current 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }
              `}>
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="ml-4 min-w-0">
                <p className={`text-sm font-medium ${
                  step.current || step.completed ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs ${
                  step.current || step.completed ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                steps[index + 1].current || steps[index + 1].completed || step.completed
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CheckoutStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isProcessing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete?: () => void;
}

export function CheckoutStepNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isProcessing,
  onPrevious,
  onNext,
  onComplete
}: CheckoutStepNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const isConfirmationStep = currentStep === 4;

  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={isFirstStep || isProcessing}
        className={`
          flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
          ${isFirstStep || isProcessing
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      {/* Step Indicator */}
      <div className="text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Next/Complete Button */}
      {isConfirmationStep ? (
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue Shopping
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <button
          onClick={isLastStep ? onComplete : onNext}
          disabled={!canProceed || isProcessing}
          className={`
            flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors
            ${!canProceed || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isLastStep
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : isLastStep ? (
            <>
              Place Order
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
