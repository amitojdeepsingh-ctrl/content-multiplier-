import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const PLAN_LIMITS = {
  [process.env.STRIPE_PRICE_STARTER]: { plan: 'starter', limit: 10 },
  [process.env.STRIPE_PRICE_PRO]: { plan: 'pro', limit: 50 },
  [process.env.STRIPE_PRICE_AGENCY]: { plan: 'agency', limit: 999999 },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return res.status(400).json({ error: `Webhook Error: ${error.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer
        const subscriptionId = session.subscription

        // Get customer
        const customer = await stripe.customers.retrieve(customerId)
        const userId = customer.metadata.user_id

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const planConfig = PLAN_LIMITS[priceId]

        if (planConfig) {
          await supabase
            .from('profiles')
            .update({
              plan: planConfig.plan,
              transforms_limit: planConfig.limit,
              stripe_subscription_id: subscriptionId,
              transforms_used: 0,
              credits_reset_at: new Date().toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const customer = await stripe.customers.retrieve(customerId)
        const userId = customer.metadata.user_id
        const priceId = subscription.items.data[0].price.id
        const planConfig = PLAN_LIMITS[priceId]

        if (planConfig) {
          await supabase
            .from('profiles')
            .update({
              plan: planConfig.plan,
              transforms_limit: planConfig.limit,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const customer = await stripe.customers.retrieve(customerId)
        const userId = customer.metadata.user_id

        // Downgrade to free
        await supabase
          .from('profiles')
          .update({
            plan: 'free',
            transforms_limit: 4,
            stripe_subscription_id: null,
            transforms_used: 0,
            credits_reset_at: new Date().toISOString(),
          })
          .eq('id', userId)
        break
      }
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: error.message })
  }
}
