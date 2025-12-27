import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()
    
    if (!artisan) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (!artisan.stripeSubscriptionId) {
      return NextResponse.json({
        subscription: null,
        status: 'inactive',
      })
    }

    const subscription = await stripe.subscriptions.retrieve(
      artisan.stripeSubscriptionId
    )

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items.data[0]?.price.id,
      },
      status: subscription.status,
    })
  } catch (error: any) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}

