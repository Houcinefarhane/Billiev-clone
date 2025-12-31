import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { prisma } from './prisma'
import { authOptions } from './auth-nextauth'

export async function getCurrentArtisan() {
  try {
    // Méthode 1: Vérifier les cookies custom (authentification email/password)
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
        return artisan
      }
    }

    // Méthode 2: Vérifier NextAuth session (OAuth Google)
    const session = await getServerSession(authOptions)
    
    if (session?.user?.email) {
      const artisan = await prisma.artisan.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      if (artisan) {
        return artisan
      }
    }

    return null
  } catch (error) {
    console.error('getCurrentArtisan - Erreur:', error)
    return null
  }
}

