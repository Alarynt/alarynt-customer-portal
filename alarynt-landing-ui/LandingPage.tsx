import React from 'react';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { SignupSection } from './components/SignupSection';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <SignupSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;