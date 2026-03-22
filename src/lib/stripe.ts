import { loadStripe } from '@stripe/stripe-js'

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

export const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null

export const PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  starter: {
    monthly: 'price_starter_monthly',
    annual: 'price_starter_annual',
  },
  pro: {
    monthly: 'price_pro_monthly',
    annual: 'price_pro_annual',
  },
  agency: {
    monthly: 'price_agency_monthly',
    annual: 'price_agency_annual',
  },
}

export async function redirectToCheckout(params: { plan: 'starter' | 'pro' | 'agency'; interval: 'monthly' | 'annual'; customerEmail?: string }) {
  if (!stripePromise) throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY')
  const stripe = await stripePromise
  if (!stripe) throw new Error('Stripe failed to initialize')

  const amountByPlan = {
    starter: params.interval === 'monthly' ? 29 : 290,
    pro: params.interval === 'monthly' ? 59 : 590,
    agency: params.interval === 'monthly' ? 99 : 990,
  }

  const origin = window.location.origin

  await stripe.redirectToCheckout({
    lineItems: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `CoachCRM ${params.plan} (${params.interval})` },
        unit_amount: amountByPlan[params.plan] * 100,
        recurring: { interval: params.interval === 'monthly' ? 'month' : 'year' },
      },
      quantity: 1,
    }],
    mode: 'subscription',
    customerEmail: params.customerEmail,
    successUrl: `${origin}/checkout/success?plan=${params.plan}`,
    cancelUrl: `${origin}/settings`,
  })
}
