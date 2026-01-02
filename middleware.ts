import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Gérer les sessions Supabase Auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchir la session si nécessaire
  await supabase.auth.getUser()

  // 🔒 Headers de sécurité essentiels
  
  // 1. X-Frame-Options: Empêche le site d'être affiché dans une iframe
  // Pourquoi ? Évite le "clickjacking" : un site malveillant pourrait afficher ton site
  // dans une iframe invisible et faire cliquer l'utilisateur sur des boutons
  response.headers.set('X-Frame-Options', 'DENY')

  // 2. X-Content-Type-Options: Force le navigateur à respecter le type MIME
  // Pourquoi ? Empêche les attaques MIME-sniffing où un fichier malveillant
  // pourrait être exécuté comme du JavaScript
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // 3. X-XSS-Protection: Active la protection XSS du navigateur
  // Pourquoi ? Bloque les scripts malveillants injectés dans les pages
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // 4. Referrer-Policy: Contrôle les informations envoyées dans le header Referer
  // Pourquoi ? Évite de fuiter des URLs sensibles vers d'autres sites
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 5. Content-Security-Policy: Définit quelles ressources peuvent être chargées
  // Pourquoi ? Empêche le chargement de scripts/styles malveillants depuis d'autres sites
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " + // unsafe-inline nécessaire pour Next.js
    "style-src 'self' 'unsafe-inline'; " + // unsafe-inline nécessaire pour Tailwind
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com; " +
    "frame-ancestors 'none';"
  )

  // 6. Strict-Transport-Security (HSTS): Force HTTPS en production
  // Pourquoi ? Empêche les attaques "man-in-the-middle" en forçant toujours HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // 7. Permissions-Policy: Désactive les fonctionnalités du navigateur non nécessaires
  // Pourquoi ? Réduit la surface d'attaque en désactivant des APIs sensibles
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}

// Appliquer le middleware sur toutes les routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

