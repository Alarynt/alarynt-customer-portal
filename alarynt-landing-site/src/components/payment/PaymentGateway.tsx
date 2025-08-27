import React, { useState } from 'react';
import { CreditCard, Shield, Lock, CheckCircle } from 'lucide-react';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  name: string;
  icon: React.ReactNode;
}

export interface PaymentData {
  method: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  onPaymentSuccess: (data: PaymentData) => void;
  onPaymentError: (error: string) => void;
  className?: string;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  currency = 'USD',
  onPaymentSuccess,
  onPaymentError,
  className = ''
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'card'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: <div className="text-blue-600 font-bold text-sm">PP</div>
    },
    {
      id: 'bank',
      type: 'bank',
      name: 'Bank Transfer',
      icon: <div className="text-green-600 font-bold text-sm">BT</div>
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would integrate with:
      // - Stripe: stripe.confirmCardPayment()
      // - PayPal: paypal.payment.create()
      // - Square: squarePaymentForm.requestCardNonce()
      // - Braintree: braintree.client.create()
      
      console.log('Payment Gateway Stub - Processing payment:', {
        amount,
        currency,
        method: selectedMethod,
        data: paymentData
      });

      // Simulate successful payment
      onPaymentSuccess(paymentData);
    } catch (error) {
      onPaymentError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      {/* Payment Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-900">
            {currency} {amount.toFixed(2)}
          </div>
          <div className="text-sm text-blue-600">Total Amount</div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded">
                  {method.icon}
                </div>
                <span className="font-medium text-gray-900">{method.name}</span>
              </div>
              {selectedMethod === method.id && (
                <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedMethod === 'card' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              />
            </div>
          </>
        )}

        {selectedMethod === 'paypal' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-800 font-semibold mb-2">PayPal Integration</div>
            <p className="text-yellow-700 text-sm">
              In production, this would redirect to PayPal's secure checkout flow.
            </p>
          </div>
        )}

        {selectedMethod === 'bank' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-800 font-semibold mb-2">Bank Transfer</div>
            <p className="text-green-700 text-sm">
              Bank transfer details would be provided here with routing and account numbers.
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900">Secure Payment</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>SSL Encrypted</span>
            </div>
            <span>•</span>
            <span>PCI Compliant</span>
            <span>•</span>
            <span>256-bit Security</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Complete Payment • ${currency} ${amount.toFixed(2)}`
          )}
        </button>
      </form>
    </div>
  );
};