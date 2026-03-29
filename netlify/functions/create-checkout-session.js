import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { planId } = JSON.parse(event.body);

    if (!planId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Plan ID is required' })
      };
    }

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/pricing`,
      allow_promotion_codes: true,
      metadata: { planId }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url, sessionId: session.id })
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session', message: error.message })
    };
  }
};
