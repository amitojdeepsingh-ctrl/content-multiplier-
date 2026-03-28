// src/pages/Pricing.jsx
// Pricing Page with Stripe Integration
// Replace your existing src/pages/Pricing.jsx with this file

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pricingPlans, createCheckoutSession, createPortalSession } from '../lib/stripe';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handleCheckout = async (plan) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    setLoading(plan.id);
    setError('');

    try {
      // Create checkout session
      const session = await createCheckoutSession(plan.id);
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const portalSession = await createPortalSession();
      window.location.href = portalSession.url;
    } catch (err) {
      console.error('Portal error:', err);
      setError('Failed to open subscription management.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {/* Current Plan Notice */}
        {profile?.plan && (
          <div className="bg-blue-600/10 border border-blue-600 rounded-lg p-4 mb-8 text-center">
            <p className="text-blue-400">
              Current Plan: <strong className="text-white capitalize">{profile.plan}</strong>
            </p>
            {profile.plan !== 'free' && (
              <button
                onClick={handleManageSubscription}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Manage Subscription
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-8 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-900 rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-blue-600 shadow-xl shadow-blue-600/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-slate-400">/{plan.interval}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleCheckout(plan)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-slate-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              7-Day Money-Back Guarantee
            </h3>
            <p className="text-slate-400">
              Try any paid plan risk-free. Not satisfied? Full refund, no questions asked.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-400">
                Yes! Cancel anytime in your account settings. You'll keep access until the end of your billing period.
              </p>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-400">
                We accept all major credit cards (Visa, MasterCard, Amex) and debit cards through Stripe's secure checkout.
              </p>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I upgrade or downgrade later?
              </h3>
              <p className="text-slate-400">
                Yes! You can upgrade or downgrade your plan anytime from your account settings. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Is my payment information secure?
              </h3>
              <p className="text-slate-400">
                Absolutely. We use Stripe, which is PCI DSS certified. We never store your credit card information on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
