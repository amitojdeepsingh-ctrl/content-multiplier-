// src/lib/stripe.js
// Stripe Configuration - LIVE MODE
// This file initializes Stripe for your app

import { loadStripe } from '@stripe/stripe-js';

// Get your publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('Stripe publishable key is not set!');
}

// Initialize Stripe
export const stripe = loadStripe(stripePublishableKey);

// Pricing plans configuration with LIVE Price IDs
export const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    interval: 'month',
    features: [
      '10 transformations/month',
      'All platforms (Twitter, LinkedIn, Instagram, Email, TikTok)',
      'Standard AI quality',
      'Copy-paste functionality',
      'Email support'
    ],
    priceId: 'price_1TFgiDKDDaYI6VISWeaVtitW' // LIVE Price ID
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    interval: 'month',
    popular: true,
    features: [
      '50 transformations/month',
      'All platforms',
      'Premium AI quality',
      'Custom brand voice',
      'Export to CSV/PDF',
      'Priority email support',
      'Save unlimited transformations'
    ],
    priceId: 'price_1TFgnJKDDaYI6VISSzWrrDZB' // LIVE Price ID
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 49,
    interval: 'month',
    features: [
      'Unlimited transformations',
      'Everything in Pro',
      'White-label (remove branding)',
      'Up to 5 team seats',
      'Unlimited brand voices',
      'API access',
      'Priority support + Slack channel',
      'Client reporting'
    ],
    priceId: 'price_1TFgntKDDaYI6VISjNp0Ypmv' // LIVE Price ID
  }
];

// Function to create Stripe checkout session
export const createCheckoutSession = async (planId) => {
  try {
    // Call your backend to create checkout session
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ planId })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Function to create customer portal session (for managing subscriptions)
export const createPortalSession = async () => {
  try {
    const response = await fetch('/.netlify/functions/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

export default stripe;
