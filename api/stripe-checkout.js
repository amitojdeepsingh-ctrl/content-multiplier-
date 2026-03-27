import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail } = req.body

    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get or create Stripe customer
    let { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId },
      })
      customerId = customer.id

      // Save to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VERCEL_URL || 'http://localhost:5173'}/dashboard?checkout=success`,
      cancel_url: `${process.env.VERCEL_URL || 'http://localhost:5173'}/pricing`,
      metadata: { user_id: userId },
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    res.status(500).json({ error: error.message })
  }
}
