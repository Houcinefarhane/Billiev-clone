import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const artisanId = session.metadata?.artisanId

        if (artisanId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await prisma.artisan.update({
            where: { id: artisanId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              subscriptionStatus: subscription.status,
              subscriptionCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const artisan = await prisma.artisan.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (artisan) {
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: {
              subscriptionStatus: subscription.status,
              subscriptionCurrentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
              stripeSubscriptionId:
                subscription.status === 'canceled' ? null : subscription.id,
            },
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const artisan = await prisma.artisan.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (artisan && invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )

          await prisma.artisan.update({
            where: { id: artisan.id },
            data: {
              subscriptionStatus: subscription.status,
              subscriptionCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const artisan = await prisma.artisan.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (artisan) {
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: {
              subscriptionStatus: 'past_due',
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

