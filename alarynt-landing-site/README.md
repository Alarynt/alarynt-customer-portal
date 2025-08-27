# Alarynt Landing Site

A modern, standalone React landing page for the Alarynt Rules Platform. This site showcases the platform's capabilities, pricing, and provides a complete signup flow with payment integration stubs.

![Alarynt Landing Site](https://img.shields.io/badge/React-18.3-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg) ![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)

## ✨ Features

- 🎨 **Modern Design**: Clean, responsive UI with Tailwind CSS
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds
- 📱 **Mobile-First**: Fully responsive design that works on all devices
- 💳 **Payment Ready**: Integrated payment gateway stubs for Stripe, PayPal, and more
- 🔍 **SEO Optimized**: Structured data and meta tags for search engines
- ♿ **Accessible**: WCAG compliant with proper ARIA labels
- 🌐 **Production Ready**: Optimized builds with code splitting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alarynt-landing-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_ENVIRONMENT=sandbox
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
alarynt-landing-site/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── payment/        # Payment-related components
│   │   ├── Header.tsx      # Site header with navigation
│   │   ├── HeroSection.tsx # Hero section
│   │   ├── FeaturesSection.tsx # Features showcase
│   │   ├── PricingSection.tsx  # Pricing plans
│   │   ├── SignupSection.tsx   # Multi-step signup
│   │   └── Footer.tsx      # Site footer
│   ├── pages/              # Page components
│   │   └── LandingPage.tsx # Main landing page
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🎨 Sections Overview

### 🏠 Header
- Responsive navigation with mobile menu
- Call-to-action buttons
- Brand logo and identity

### 🎯 Hero Section
- Compelling headline and value proposition
- Key benefit highlights
- Interactive dashboard mockup
- Trust indicators

### ⚡ Features Section  
- Platform capabilities showcase
- Performance metrics
- Visual feature grid with icons
- Customer benefits

### 💰 Pricing Section
- Three-tier pricing structure
- Monthly/yearly billing toggle
- Feature comparisons
- FAQ section

### 📝 Signup Section
- Multi-step registration flow
- Form validation and progress tracking
- Plan selection interface
- Payment gateway integration

### 🔗 Footer
- Company information and links
- Newsletter signup
- Social media links
- Legal pages

## 💳 Payment Integration

The site includes payment gateway stubs ready for integration:

### Supported Providers
- **Stripe**: Card payments, subscriptions
- **PayPal**: PayPal account and credit card processing  
- **Square**: In-person and online payments
- **Bank Transfer**: ACH and wire transfers

### Implementation
```typescript
import { PaymentProvider, PaymentGateway } from './components/payment';

const paymentConfig = {
  stripePublishableKey: 'pk_live_...',
  paypalClientId: 'your-client-id',
  environment: 'production'
};

<PaymentProvider config={paymentConfig}>
  <PaymentGateway
    amount={99.00}
    currency="USD"
    onPaymentSuccess={(data) => handleSuccess(data)}
    onPaymentError={(error) => handleError(error)}
  />
</PaymentProvider>
```

## 🌍 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Deploy to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables in Netlify dashboard

### Deploy to AWS S3 + CloudFront
```bash
# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENVIRONMENT` | Environment (sandbox/production) | `sandbox` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - |
| `VITE_PAYPAL_CLIENT_ID` | PayPal client ID | - |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | - |
| `VITE_API_BASE_URL` | API base URL | - |

### Customization

#### Branding
- Update colors in `tailwind.config.js`
- Replace logo and favicon in `public/`
- Modify company information in components

#### Content
- Edit hero section messaging in `HeroSection.tsx`
- Update features in `FeaturesSection.tsx`
- Modify pricing plans in `PricingSection.tsx`
- Change footer links in `Footer.tsx`

#### Styling
- Global styles in `src/index.css`
- Component-specific styles using Tailwind classes
- Custom color palette in Tailwind configuration

## 📊 Performance

### Lighthouse Scores (Target)
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Optimization Features
- Code splitting by route and vendor
- Optimized bundle sizes with tree shaking  
- Image lazy loading and optimization
- Efficient CSS with PurgeCSS
- Service worker for caching (optional)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests  
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://alarynt.com)
- [Documentation](https://docs.alarynt.com)
- [API Reference](https://api.alarynt.com/docs)
- [Support](mailto:support@alarynt.com)

## 🆘 Support

For support and questions:

- 📧 Email: [support@alarynt.com](mailto:support@alarynt.com)
- 💬 Discord: [Alarynt Community](https://discord.gg/alarynt)
- 📖 Docs: [docs.alarynt.com](https://docs.alarynt.com)
- 🐛 Issues: [GitHub Issues](https://github.com/alarynt/landing-site/issues)

---

Made with ❤️ by the Alarynt team