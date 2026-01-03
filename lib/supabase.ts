import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Variables d'environnement requises
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Assertions de type pour TypeScript (on sait qu'ils sont définis après la vérification)
const SUPABASE_URL = supabaseUrl as string
const SUPABASE_ANON_KEY = supabaseAnonKey as string

// Client pour usage côté serveur (API routes, Server Components)
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Client pour usage côté client (Client Components)
export function createClientSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Client simple pour usage dans les API routes
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

