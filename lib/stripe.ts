import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// IDs des prix Stripe (à configurer dans Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly',
  yearly: process.env.STRIPE_PRICE_ID_YEARLY || 'price_yearly',
}

// Plans disponibles
export const PLANS = {
  monthly: {
    name: 'Abonnement Mensuel',
    price: 29.99,
    priceId: STRIPE_PRICE_IDS.monthly,
    interval: 'month',
  },
  yearly: {
    name: 'Abonnement Annuel',
    price: 299.99,
    priceId: STRIPE_PRICE_IDS.yearly,
    interval: 'year',
  },
}

