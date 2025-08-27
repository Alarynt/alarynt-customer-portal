import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { PaymentProvider } from './components/payment/PaymentProvider'

// Payment configuration
const paymentConfig = {
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_stub',
  paypalClientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'paypal-client-id',
  environment: (import.meta.env.VITE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
}

function App() {
  return (
    <PaymentProvider config={paymentConfig}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </PaymentProvider>
  )
}

export default App