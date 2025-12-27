import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const artisan = await getCurrentArtisan()
    
    if (!artisan) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId } = body // 'monthly' ou 'yearly'

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      )
    }

    const plan = PLANS[planId as keyof typeof PLANS]
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'

    // Créer ou récupérer le customer Stripe
    let customerId = artisan.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: artisan.email,
        name: artisan.name,
        metadata: {
          artisanId: artisan.id,
        },
      })
      customerId = customer.id

      // Sauvegarder le customer ID
      await prisma.artisan.update({
        where: { id: artisan.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard/abonnement?success=true`,
      cancel_url: `${baseUrl}/dashboard/abonnement?canceled=true`,
      metadata: {
        artisanId: artisan.id,
        planId: planId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}

