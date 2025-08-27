import React, { useState } from 'react';
import { ArrowRight, Mail, User, Building, CreditCard, Shield, CheckCircle } from 'lucide-react';

export const SignupSection: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    plan: 'professional',
    paymentMethod: 'card'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Handle final submission
      console.log('Form submitted:', formData);
      alert('Sign-up completed! (This is a stub implementation)');
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        return formData.company && formData.plan;
      case 3:
        return true; // Payment step - would validate payment info in real implementation
      default:
        return false;
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29/month',
      description: 'Perfect for small teams'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$99/month',
      description: 'Ideal for growing businesses',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$299/month',
      description: 'For large organizations'
    }
  ];

  return (
    <section id="signup" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>Get Started Today</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Start your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> free trial</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of teams already using Alarynt to build intelligent rules for their applications.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    step >= stepNumber
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-0.5 transition-all duration-300 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 md:p-12">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600">Let's start with your basic details</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Company & Plan */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Building className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Company & Plan</h3>
                  <p className="text-gray-600">Tell us about your organization and choose your plan</p>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Choose Your Plan *
                  </label>
                  <div className="grid gap-4">
                    {plans.map((plan) => (
                      <label
                        key={plan.id}
                        className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-300 ${
                          formData.plan === plan.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={formData.plan === plan.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">{plan.name}</span>
                                {plan.popular && (
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{plan.description}</p>
                            </div>
                            <span className="font-bold text-gray-900">{plan.price}</span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ml-4 ${
                            formData.plan === plan.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.plan === plan.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment (Stub) */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Information</h3>
                  <p className="text-gray-600">Secure payment processing (14-day free trial)</p>
                </div>

                {/* Payment Method Stub */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Payment Gateway Integration</h4>
                  <p className="text-gray-600 mb-4">
                    This section will integrate with Stripe, PayPal, or other payment providers.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Secure SSL encryption</p>
                    <p>• PCI compliant processing</p>
                    <p>• 14-day free trial included</p>
                    <p>• Cancel anytime</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">Order Summary</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-800">Plan: {plans.find(p => p.id === formData.plan)?.name}</span>
                    <span className="font-semibold text-blue-900">{plans.find(p => p.id === formData.plan)?.price}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-800">Free Trial Period</span>
                    <span className="font-semibold text-green-600">14 days</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-900">Due Today</span>
                      <span className="font-bold text-blue-900">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Back
                </button>
              )}
              <div className={step === 1 ? 'ml-auto' : ''}>
                <button
                  type="submit"
                  disabled={!isStepValid()}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                    isStepValid()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>{step === 3 ? 'Start Free Trial' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Trusted by thousands of companies worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-60">
            <div className="text-lg font-bold text-gray-400">TechCorp</div>
            <div className="text-lg font-bold text-gray-400">DataFlow</div>
            <div className="text-lg font-bold text-gray-400">CloudScale</div>
            <div className="text-lg font-bold text-gray-400">InnovateLab</div>
          </div>
        </div>
      </div>
    </section>
  );
};