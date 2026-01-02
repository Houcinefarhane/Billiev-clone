import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Déconnecter de Supabase Auth
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return NextResponse.json({ success: true }) // Retourner success même en cas d'erreur
  }
}

