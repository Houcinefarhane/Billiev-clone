// Script pour tester la connexion à la base de données
import { PrismaClient } from '@prisma/client'

async function testConnection() {
  console.log('Test de connexion à la base de données...\n')

  // Vérifier DATABASE_URL
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ ERREUR: DATABASE_URL n\'est pas défini')
    console.error('Vérifiez votre fichier .env')
    process.exit(1)
  }

  console.log('✅ DATABASE_URL trouvé')
  console.log('Format:', dbUrl.substring(0, 30) + '...\n')

  // Vérifier le format
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ ERREUR: DATABASE_URL doit commencer par postgresql:// ou postgres://')
    console.error('Format actuel:', dbUrl.substring(0, 30))
    process.exit(1)
  }

  console.log('✅ Format DATABASE_URL valide\n')

  // Tester la connexion
  const prisma = new PrismaClient()

  try {
    console.log('Tentative de connexion...')
    await prisma.$connect()
    console.log('✅ Connexion réussie!\n')

    // Tester une requête simple
    const count = await prisma.artisan.count()
    console.log(`✅ Requête test réussie (${count} artisan(s) dans la base)\n`)

    await prisma.$disconnect()
    console.log('✅ Test terminé avec succès')
  } catch (error: any) {
    console.error('❌ ERREUR de connexion:')
    console.error(error.message)

    if (error.message?.includes('did not match the expected pattern')) {
      console.error('\n🔍 Le problème vient du format de DATABASE_URL')
      console.error('Vérifiez que:')
      console.error('1. Le mot de passe ne contient pas de caractères spéciaux non encodés')
      console.error('2. Le format est: postgresql://user:password@host:port/database')
      console.error('3. Si le mot de passe contient des caractères spéciaux, encodez-les avec encodeURIComponent()')
    }

    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()

