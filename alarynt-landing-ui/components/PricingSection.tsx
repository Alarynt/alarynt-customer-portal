import React, { useState } from 'react';
import { Check, X, Star, Zap, Shield, Users, Crown, ArrowRight } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams and projects',
      monthlyPrice: 29,
      yearlyPrice: 290,
      icon: Zap,
      color: 'border-blue-200 hover:border-blue-300',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      features: [
        '10,000 rule executions/month',
        'Visual rule builder',
        'Basic analytics',
        'Email support',
        '5 team members',
        '10 rule sets',
        'Standard integrations'
      ],
      limitations: [
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'SSO integration'
      ]
    },
    {
      name: 'Professional',
      description: 'Ideal for growing businesses',
      monthlyPrice: 99,
      yearlyPrice: 990,
      icon: Users,
      color: 'border-purple-200 hover:border-purple-300 ring-2 ring-purple-300',
      buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      popular: true,
      features: [
        '100,000 rule executions/month',
        'Advanced rule builder',
        'Real-time analytics',
        'Priority support',
        '25 team members',
        'Unlimited rule sets',
        'All integrations',
        'Version control',
        'A/B testing'
      ],
      limitations: [
        'Custom SLA',
        'Dedicated support',
        'On-premises deployment'
      ]
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with complex needs',
      monthlyPrice: 299,
      yearlyPrice: 2990,
      icon: Crown,
      color: 'border-green-200 hover:border-green-300',
      buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
      features: [
        'Unlimited rule executions',
        'Enterprise rule builder',
        'Advanced analytics & insights',
        'Dedicated support manager',
        'Unlimited team members',
        'Unlimited rule sets',
        'Custom integrations',
        'SSO & SAML integration',
        'Audit logs & compliance',
        '99.99% SLA guarantee',
        'On-premises deployment',
        'Custom training'
      ],
      limitations: []
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const unit = billingPeriod === 'monthly' ? 'month' : 'year';
    return { price, unit };
  };

  const getSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - yearlyPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage;
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            <span>Simple Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose the perfect plan for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> your team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free, scale as you grow. All plans include our core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Save up to 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const { price, unit } = getPrice(plan);
            const Icon = plan.icon;
            
            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${plan.color} ${
                  plan.popular ? 'scale-105 shadow-xl' : 'shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                      plan.name === 'Starter' ? 'bg-blue-100 text-blue-600' :
                      plan.name === 'Professional' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-5xl font-bold text-gray-900">${price}</span>
                      <span className="text-gray-600">/{unit}</span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <p className="text-green-600 text-sm font-medium mt-2">
                        Save {getSavings(plan.monthlyPrice, plan.yearlyPrice)}% annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mb-8 ${plan.buttonColor}`}>
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start space-x-3 opacity-50">
                          <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">What happens if I exceed my limits?</h4>
              <p className="text-gray-600">We'll notify you before you hit your limits and offer easy upgrade options.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer custom enterprise plans?</h4>
              <p className="text-gray-600">Yes, we work with large organizations to create custom solutions that fit their needs.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">All plans include a 14-day free trial with full access to features.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};