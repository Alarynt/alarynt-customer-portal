# Alarynt Landing UI

A comprehensive customer-facing landing page for the Alarynt Rules Platform. This UI showcases the platform's capabilities, presents pricing information, and provides a seamless signup experience with payment integration stubs.

## Features

### 🎨 **Modern, Responsive Design**
- Mobile-first responsive layout
- Tailwind CSS for styling
- Smooth animations and transitions
- Accessibility-focused components

### 🚀 **Complete Landing Experience**
- **Hero Section**: Engaging introduction with key benefits
- **Features Section**: Comprehensive platform capabilities showcase
- **Pricing Section**: Flexible pricing tiers with monthly/yearly toggle
- **Signup Section**: Multi-step registration flow
- **Payment Integration**: Stubbed payment gateway components

### 💳 **Payment Gateway Stubs**
Ready-to-integrate payment components for:
- Stripe
- PayPal
- Square
- Bank transfers

## Component Structure

```
alarynt-landing-ui/
├── LandingPage.tsx              # Main landing page component
├── components/
│   ├── Header.tsx               # Navigation header with responsive menu
│   ├── HeroSection.tsx          # Hero section with CTA
│   ├── FeaturesSection.tsx      # Platform features and benefits
│   ├── PricingSection.tsx       # Pricing tiers and plans
│   ├── SignupSection.tsx        # Multi-step signup form
│   ├── Footer.tsx               # Footer with links and newsletter
│   └── payment/
│       ├── PaymentGateway.tsx   # Payment processing component
│       └── PaymentProvider.tsx  # Payment context and stubs
├── index.ts                     # Export barrel
└── README.md                    # This file
```

## Quick Start

### 1. Import the Landing Page

```typescript
import { LandingPage } from './alarynt-landing-ui';

function App() {
  return <LandingPage />;
}
```

### 2. Use Individual Components

```typescript
import { 
  Header, 
  HeroSection, 
  FeaturesSection, 
  PricingSection,
  SignupSection,
  Footer 
} from './alarynt-landing-ui';

function CustomLanding() {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <SignupSection />
      <Footer />
    </div>
  );
}
```

### 3. Payment Integration

```typescript
import { 
  PaymentProvider, 
  PaymentGateway,
  PaymentConfig 
} from './alarynt-landing-ui';

const paymentConfig: PaymentConfig = {
  stripePublishableKey: 'pk_test_...',
  paypalClientId: 'your-paypal-client-id',
  environment: 'sandbox'
};

function PaymentFlow() {
  return (
    <PaymentProvider config={paymentConfig}>
      <PaymentGateway
        amount={99.00}
        currency="USD"
        onPaymentSuccess={(data) => console.log('Payment successful:', data)}
        onPaymentError={(error) => console.error('Payment failed:', error)}
      />
    </PaymentProvider>
  );
}
```

## Features Breakdown

### 🎯 **Hero Section**
- Compelling headline and value proposition
- Key benefit indicators
- Primary and secondary CTAs
- Trust indicators and social proof
- Animated visual elements

### ⚡ **Features Section**
- Visual feature grid with icons
- Performance metrics and statistics
- Benefit-focused copy
- Interactive hover effects

### 💰 **Pricing Section**
- Three-tier pricing structure
- Monthly/yearly billing toggle with savings
- Feature comparison
- Popular plan highlighting
- FAQ section

### 📝 **Signup Section**
- Multi-step form (Personal Info → Company & Plan → Payment)
- Progress indicator
- Form validation
- Plan selection
- Payment integration ready

### 💳 **Payment Integration**
Currently stubbed for easy integration with:

- **Stripe**: Card payments, subscriptions, invoicing
- **PayPal**: PayPal account and credit card processing
- **Square**: In-person and online payments
- **Bank Transfer**: ACH and wire transfer support

## Dependencies

This component library requires:
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (for icons)

## Integration with Main App

To integrate into your existing React Router app:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './alarynt-landing-ui';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<YourMainApp />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Customization

### Styling
All components use Tailwind CSS classes and can be customized by:
1. Modifying the existing classes
2. Adding custom CSS
3. Using Tailwind's configuration system

### Content
Update the following for your specific use case:
- Hero section messaging
- Feature descriptions
- Pricing plans and amounts
- Company information in footer
- Contact details

### Payment Gateways
Replace the stub implementations with actual payment provider SDKs:

```typescript
// Replace PaymentProvider stubs with real implementations
import { loadStripe } from '@stripe/stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
```

## Performance Features

- **Code Splitting**: Components can be lazy-loaded
- **Optimized Images**: Placeholder for optimized image loading
- **SEO Friendly**: Semantic HTML structure
- **Accessibility**: ARIA labels and keyboard navigation
- **Mobile Optimized**: Touch-friendly interactions

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

The components are built with modern React patterns:
- Functional components with hooks
- TypeScript for type safety
- Responsive design principles
- Performance optimization

## Production Considerations

Before going live:

1. **Replace Payment Stubs**: Implement actual payment processing
2. **Add Analytics**: Integrate Google Analytics, Mixpanel, etc.
3. **SEO Optimization**: Add meta tags, structured data
4. **Performance**: Optimize images, add CDN
5. **Security**: Implement CSP, validate inputs
6. **Testing**: Add unit and integration tests

## License

This component library is part of the Alarynt project.