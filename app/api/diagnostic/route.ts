import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnostic: any = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlInfo: null,
    connectionTest: null,
    error: null,
  }

  // Analyser DATABASE_URL sans exposer le mot de passe
  if (process.env.DATABASE_URL) {
    try {
      const urlObj = new URL(process.env.DATABASE_URL)
      diagnostic.databaseUrlInfo = {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || '5432 (défaut)',
        pathname: urlObj.pathname,
        username: urlObj.username,
        hasPassword: !!urlObj.password,
        passwordLength: urlObj.password?.length || 0,
      }
    } catch (e: any) {
      diagnostic.databaseUrlInfo = {
        error: 'Format URL invalide',
        message: e.message,
      }
    }
  }

  // Tester la connexion
  try {
    await prisma.$connect()
    diagnostic.connectionTest = {
      success: true,
      message: 'Connexion réussie',
    }
    
    // Tester une requête simple
    try {
      const count = await prisma.artisan.count()
      diagnostic.connectionTest.queryTest = {
        success: true,
        artisanCount: count,
      }
    } catch (queryError: any) {
      diagnostic.connectionTest.queryTest = {
        success: false,
        error: queryError.message,
        code: queryError.code,
      }
    }
    
    await prisma.$disconnect()
  } catch (error: any) {
    diagnostic.connectionTest = {
      success: false,
      error: error.message,
      code: error.code,
      type: error.constructor?.name,
    }
    
    // Messages d'aide selon le code d'erreur
    if (error.code === 'P1001') {
      diagnostic.connectionTest.help = 'Impossible de se connecter au serveur. Vérifiez que DATABASE_URL est correct et que Supabase est accessible. Essayez peut-être le pooler sur le port 6543.'
    } else if (error.code === 'P1000') {
      diagnostic.connectionTest.help = 'Échec d\'authentification. Vérifiez le mot de passe dans DATABASE_URL (doit être URL-encodé, ex: ! devient %21).'
    } else if (error.code === 'P1013') {
      diagnostic.connectionTest.help = 'Format de connexion invalide. Vérifiez le format de DATABASE_URL.'
    }
  }

  return NextResponse.json(diagnostic, {
    status: diagnostic.connectionTest?.success ? 200 : 500,
  })
}

