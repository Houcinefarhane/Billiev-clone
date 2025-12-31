import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Vérifier si l'artisan existe déjà
          const existingArtisan = await prisma.artisan.findUnique({
            where: { email: user.email! },
          })

          if (!existingArtisan) {
            // Créer un nouveau compte Artisan
            await prisma.artisan.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                password: null, // Pas de mot de passe pour OAuth
                emailVerified: true, // Email vérifié via Google
              },
            })
          } else if (!existingArtisan.emailVerified) {
            // Mettre à jour si l'email n'était pas vérifié
            await prisma.artisan.update({
              where: { id: existingArtisan.id },
              data: {
                emailVerified: true,
                name: user.name || existingArtisan.name,
              },
            })
          }
        } catch (error) {
          console.error('Error creating/updating artisan from OAuth:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      // Récupérer artisanId depuis le token (déjà stocké dans jwt callback)
      if (token.artisanId) {
        ;(session as any).artisanId = token.artisanId
      }
      
      // Si pas dans le token, chercher par email
      if (!token.artisanId && session.user?.email) {
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
          ;(session as any).artisanId = artisan.id
          session.user.name = artisan.name
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Lors de la première connexion OAuth
      if (account?.provider === 'google' && user?.email) {
        const artisan = await prisma.artisan.findUnique({
          where: { email: user.email },
          select: { id: true },
        })
        if (artisan) {
          token.artisanId = artisan.id
        }
      }
      // Si artisanId déjà dans le token, le garder
      return token
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

