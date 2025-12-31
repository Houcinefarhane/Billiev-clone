import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { prisma } from './prisma'
import { authOptions } from './auth-nextauth'

export async function getCurrentArtisan() {
  try {
    // PRIORITÉ 1: Vérifier NextAuth session (OAuth Google) - prioritaire car plus récent
    const session = await getServerSession(authOptions)
    
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim()
      const artisan = await prisma.artisan.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      if (artisan) {
        console.log('getCurrentArtisan - Artisan trouvé via NextAuth session:', artisan.email)
        // Si session NextAuth existe, on ignore les cookies custom pour éviter les conflits
        return artisan
      } else {
        console.warn('getCurrentArtisan - Session NextAuth trouvée mais artisan non trouvé pour:', email)
      }
    }

    // PRIORITÉ 2: Vérifier les cookies custom (authentification email/password)
    // Seulement si pas de session NextAuth active
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    if (artisanId) {
      const artisan = await prisma.artisan.findUnique({
        where: { id: artisanId },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      if (artisan) {
        console.log('getCurrentArtisan - Artisan trouvé via cookie:', artisan.email)
        return artisan
      }
    }

    console.log('getCurrentArtisan - Aucun artisan trouvé')
    return null
  } catch (error) {
    console.error('getCurrentArtisan - Erreur:', error)
    return null
  }
}

