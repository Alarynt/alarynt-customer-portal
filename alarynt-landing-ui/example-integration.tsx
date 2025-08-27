/**
 * Example Integration
 * 
 * This file demonstrates how to integrate the Alarynt Landing UI
 * into an existing React application with React Router.
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage, PaymentProvider } from './index';

// Example payment configuration
const paymentConfig = {
  stripePublishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_stub',
  paypalClientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'paypal-client-id',
  environment: 'sandbox' as const
};

/**
 * Full Integration Example
 * Shows how to use the complete landing page as the main route
 */
export const FullLandingIntegration: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PaymentProvider config={paymentConfig}>
              <LandingPage />
            </PaymentProvider>
          } 
        />
        <Route path="/app" element={<div>Your Main Application</div>} />
        <Route path="/dashboard" element={<div>User Dashboard</div>} />
      </Routes>
    </BrowserRouter>
  );
};

/**
 * Custom Layout Integration
 * Shows how to use individual components in a custom layout
 */
import { 
  Header, 
  HeroSection, 
  FeaturesSection, 
  PricingSection,
  SignupSection,
  Footer 
} from './index';

export const CustomLandingIntegration: React.FC = () => {
  return (
    <PaymentProvider config={paymentConfig}>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <HeroSection />
          
          {/* Custom section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Custom Content Section
              </h2>
              <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
                Add your own custom content between the standard landing page sections.
              </p>
            </div>
          </section>
          
          <FeaturesSection />
          <PricingSection />
          <SignupSection />
        </main>
        <Footer />
      </div>
    </PaymentProvider>
  );
};

/**
 * Payment Flow Integration
 * Shows how to use just the payment components
 */
import { PaymentGateway } from './index';

export const PaymentOnlyIntegration: React.FC = () => {
  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    // Handle successful payment (e.g., redirect to success page)
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    // Handle payment error (e.g., show error message)
  };

  return (
    <PaymentProvider config={paymentConfig}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
            <p className="text-gray-600 mt-2">Secure payment processing</p>
          </div>
          
          <PaymentGateway
            amount={99.00}
            currency="USD"
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            className="bg-white rounded-2xl shadow-lg p-8"
          />
        </div>
      </div>
    </PaymentProvider>
  );
};

/**
 * Environment-specific Integration
 * Shows how to handle different environments
 */
export const EnvironmentAwareLanding: React.FC = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  const config = {
    ...paymentConfig,
    environment: (isProduction ? 'production' : 'sandbox') as const,
    stripePublishableKey: isProduction 
      ? process.env.REACT_APP_STRIPE_LIVE_KEY 
      : process.env.REACT_APP_STRIPE_TEST_KEY
  };

  return (
    <PaymentProvider config={config}>
      <LandingPage />
      
      {/* Development helpers */}
      {isDevelopment && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black p-2 rounded text-xs">
          DEV MODE - Payment Stubs Active
        </div>
      )}
    </PaymentProvider>
  );
};