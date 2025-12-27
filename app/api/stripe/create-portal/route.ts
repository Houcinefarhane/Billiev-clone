import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const artisan = await getCurrentArtisan()
    
    if (!artisan) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (!artisan.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun compte Stripe associé' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: artisan.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/abonnement`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Create portal session error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session du portail' },
      { status: 500 }
    )
  }
}

