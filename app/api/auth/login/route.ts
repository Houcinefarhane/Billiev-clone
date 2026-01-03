import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { compare } from 'bcryptjs'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Authentifier avec Supabase Auth (gère automatiquement le rate limiting)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    // Si Supabase Auth échoue, vérifier si c'est un ancien compte (existe dans Prisma avec mot de passe)
    if (authError) {
      // Supabase Auth gère déjà le rate limiting
      if (authError.message.includes('rate limit') || authError.message.includes('too many')) {
        return NextResponse.json(
          { error: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.' },
          { status: 429 }
        )
      }

      // Fallback : vérifier si c'est un ancien compte dans Prisma
      const oldArtisan = await prisma.artisan.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          password: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      // Si l'utilisateur existe dans Prisma avec un mot de passe (ancien système)
      if (oldArtisan && oldArtisan.password) {
        // Vérifier le mot de passe
        const isPasswordValid = await compare(password, oldArtisan.password)
        
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Email ou mot de passe incorrect' },
            { status: 401 }
          )
        }

        // Migrer l'utilisateur vers Supabase Auth
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

        // Créer l'utilisateur dans Supabase Auth (Supabase génère un UUID)
        const { data: newAuthData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: oldArtisan.email,
          password, // Le mot de passe en clair (Supabase le hash automatiquement)
          email_confirm: true,
          user_metadata: {
            name: oldArtisan.name,
            companyName: oldArtisan.companyName || null,
            phone: oldArtisan.phone || null,
          },
        })

        if (createError) {
          console.error('Erreur migration vers Supabase Auth:', createError)
          return NextResponse.json(
            { error: 'Erreur lors de la migration du compte. Veuillez réessayer.' },
            { status: 500 }
          )
        }

        if (!newAuthData.user) {
          return NextResponse.json(
            { error: 'Erreur lors de la création du compte dans Supabase Auth' },
            { status: 500 }
          )
        }

        // Mettre à jour Prisma : changer l'ID pour correspondre à Supabase Auth et supprimer le mot de passe
        await prisma.artisan.update({
          where: { id: oldArtisan.id },
          data: {
            id: newAuthData.user.id, // Mettre à jour l'ID avec celui de Supabase Auth
            password: null,
            emailVerified: true,
          },
        })

        logger.info(`Utilisateur ${oldArtisan.email} migré vers Supabase Auth`)

        // Connecter l'utilisateur via Supabase Auth
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: oldArtisan.email,
          password,
        })

        if (signInError || !signInData.user) {
          return NextResponse.json(
            { error: 'Erreur lors de la connexion après migration' },
            { status: 500 }
          )
        }

        // Retourner les données de l'artisan
        const response = NextResponse.json({
          success: true,
          artisan: {
            id: oldArtisan.id,
            name: oldArtisan.name,
            email: oldArtisan.email,
            companyName: oldArtisan.companyName,
            phone: oldArtisan.phone,
          },
        })

        return response
      }

      // Si pas d'ancien compte, retourner l'erreur normale
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la connexion' },
        { status: 500 }
      )
    }

    // Récupérer l'artisan depuis Prisma
    const artisan = await prisma.artisan.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        phone: true,
      },
    })

    if (!artisan) {
      // L'utilisateur existe dans Supabase Auth mais pas dans Prisma
      // Créer l'artisan avec les données de Supabase Auth
      const newArtisan = await prisma.artisan.create({
        data: {
          id: authData.user.id,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Utilisateur',
          email: authData.user.email!,
          password: null,
          companyName: authData.user.user_metadata?.companyName || null,
          phone: authData.user.user_metadata?.phone || null,
          emailVerified: true, // Toujours vrai car on vérifie automatiquement à la création
          emailVerificationToken: null,
          emailVerificationTokenExpires: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      logger.info('Artisan créé automatiquement depuis Supabase Auth')

      const response = NextResponse.json({
        success: true,
        artisan: newArtisan,
      })

      return response
    }

    logger.info('Connexion réussie via Supabase Auth')

    // La session est gérée automatiquement par Supabase via les cookies
    const response = NextResponse.json({
      success: true,
      artisan: {
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
      },
    })

    return response
  } catch (error: any) {
    logger.error('Erreur login', { code: error?.code })
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

