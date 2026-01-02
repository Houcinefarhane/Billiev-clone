import { prisma } from './prisma'
import { createServerSupabaseClient } from './supabase'

export async function getCurrentArtisan() {
  try {
    // Utiliser Supabase Auth pour récupérer l'utilisateur connecté
    const supabase = createServerSupabaseClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('getCurrentArtisan - Aucun utilisateur Supabase Auth:', error?.message)
      return null
    }

    console.log('getCurrentArtisan - Utilisateur Supabase Auth trouvé:', user.email)

    // Récupérer l'artisan depuis Prisma avec l'ID de Supabase Auth
    const artisan = await prisma.artisan.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        phone: true,
      },
    })

    if (artisan) {
      console.log('✅ getCurrentArtisan - Artisan trouvé:', artisan.email)
      return artisan
    }

    // Si l'artisan n'existe pas dans Prisma mais existe dans Supabase Auth,
    // le créer automatiquement (cas de migration)
    console.warn('⚠️ getCurrentArtisan - Artisan non trouvé dans Prisma, création automatique')
    
    const newArtisan = await prisma.artisan.create({
      data: {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
        email: user.email!,
        password: null,
        companyName: user.user_metadata?.companyName || null,
        phone: user.user_metadata?.phone || null,
        emailVerified: user.email_confirmed_at !== null,
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

    console.log('✅ getCurrentArtisan - Artisan créé automatiquement:', newArtisan.email)
    return newArtisan
  } catch (error) {
    console.error('❌ getCurrentArtisan - Erreur:', error)
    return null
  }
}

