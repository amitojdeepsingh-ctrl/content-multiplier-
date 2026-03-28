// netlify/functions/create-checkout-session.js
// Stripe Checkout Session Creation (Server-side)
// This function creates Stripe checkout sessions securely

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { planId } = JSON.parse(event.body);

    if (!planId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Plan ID is required' })
      };
    }

    // Get the price ID based on plan
    const priceIds = {
      starter: 'price_1TFgiDKDDaYI6VISWeaVtitW',
      pro: 'price_1TFgnJKDDaYI6VISSzWrrDZB',
      agency: 'price_1TFgntKDDaYI6VISjNp0Ypmv'
    };

    const priceId = priceIds[planId];

    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid plan ID' })
      };
    }

    // Get or create Stripe customer
    // In a real app, you'd associate this with your user database
    // For now, we'll create a new customer for each checkout

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/pricing`,
      allow_promotion_codes: true,
      metadata: {
        planId: planId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id
      })
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message
      })
    };
  }
};
