/**
 * Alarynt Landing UI
 * 
 * A comprehensive customer-facing landing page for the Alarynt Rules Platform.
 * This module exports all the components needed to create a modern,
 * responsive marketing website.
 */

// Main Landing Page Component
export { default as LandingPage } from './LandingPage';

// Individual Section Components
export { Header } from './components/Header';
export { HeroSection } from './components/HeroSection';
export { FeaturesSection } from './components/FeaturesSection';
export { PricingSection } from './components/PricingSection';
export { SignupSection } from './components/SignupSection';
export { Footer } from './components/Footer';

// Payment Integration Components (Stubs)
export { PaymentGateway } from './components/payment/PaymentGateway';
export { PaymentProvider, usePayment } from './components/payment/PaymentProvider';
export { 
  stripePaymentStub, 
  paypalPaymentStub, 
  squarePaymentStub 
} from './components/payment/PaymentProvider';

// Types
export type { PaymentMethod, PaymentData } from './components/payment/PaymentGateway';
export type { PaymentConfig, PaymentContextType } from './components/payment/PaymentProvider';