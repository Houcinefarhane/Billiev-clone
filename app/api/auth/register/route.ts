import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, companyName, phone, invitationCode } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier le code d'invitation
    const requiredInvitationCode = 'HITMM-2026'
    if (!invitationCode || invitationCode !== requiredInvitationCode) {
      return NextResponse.json(
        { error: 'Code d\'invitation invalide. Veuillez nous contacter pour obtenir un code d\'accès.' },
        { status: 403 }
      )
    }

    // Vérifier si l'utilisateur existe déjà dans Prisma
    const existingArtisan = await prisma.artisan.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingArtisan) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Client Supabase avec service role pour créer et vérifier l'email automatiquement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur incorrecte' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Créer l'utilisateur dans Supabase Auth avec email automatiquement vérifié
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true, // Marquer l'email comme vérifié automatiquement
      user_metadata: {
        name,
        companyName: companyName || null,
        phone: phone || null,
      },
    })

    if (authError) {
      console.error('Supabase Auth error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Erreur lors de la création du compte' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      )
    }

    // Créer l'artisan dans Prisma avec l'ID de Supabase Auth
    const artisan = await prisma.artisan.create({
      data: {
        id: authData.user.id, // Utiliser l'ID de Supabase Auth
        name,
        email: email.toLowerCase().trim(),
        password: null, // Stocké dans Supabase Auth
        companyName: companyName || null,
        phone: phone || null,
        emailVerified: true, // Toujours vrai car on vérifie automatiquement
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    })

    // Compte créé avec succès
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
      artisanId: artisan.id,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

