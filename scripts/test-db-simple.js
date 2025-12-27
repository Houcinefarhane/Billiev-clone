// Test simple de connexion Prisma
require('dotenv').config({ path: '.env' })

const { PrismaClient } = require('@prisma/client')

async function test() {
  console.log('Test de connexion...\n')
  
  const dbUrl = process.env.DATABASE_URL
  console.log('DATABASE_URL trouvé:', dbUrl ? 'Oui' : 'Non')
  
  if (dbUrl) {
    // Afficher le début (sans le mot de passe)
    const masked = dbUrl.replace(/:[^:@]+@/, ':****@')
    console.log('Format:', masked.substring(0, 80) + '...')
    console.log('Longueur:', dbUrl.length)
    console.log('Commence par postgresql://', dbUrl.startsWith('postgresql://'))
    console.log('Commence par postgres://', dbUrl.startsWith('postgres://'))
  }
  
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('\n✅ Connexion réussie!')
    await prisma.$disconnect()
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    if (error.message.includes('did not match')) {
      console.error('\nLe problème vient du format de DATABASE_URL')
      console.error('Essayez ces variantes:')
      console.error('1. Sans guillemets dans .env')
      console.error('2. Avec postgres:// au lieu de postgresql://')
      console.error('3. Vérifiez qu\'il n\'y a pas d\'espaces')
    }
  }
}

test()

