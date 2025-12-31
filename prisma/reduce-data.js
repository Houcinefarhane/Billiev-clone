const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Début de la réduction des données...\n')

  // Récupérer l'artisan
  const artisan = await prisma.artisan.findFirst()
  if (!artisan) {
    console.error('❌ Aucun artisan trouvé')
    return
  }

  console.log(`✅ Artisan trouvé: ${artisan.email}\n`)

  // 1. CLIENTS - Garder seulement 50
  console.log('📋 Clients...')
  const allClients = await prisma.client.findMany({
    where: { artisanId: artisan.id },
    orderBy: { createdAt: 'asc' }
  })
  console.log(`  Actuellement: ${allClients.length} clients`)
  
  if (allClients.length > 50) {
    const clientsToKeep = allClients.slice(0, 50).map(c => c.id)
    const clientsToDelete = allClients.slice(50).map(c => c.id)
    
    // Supprimer les clients en excès (cascade supprimera aussi leurs interventions, factures, etc.)
    await prisma.client.deleteMany({
      where: {
        id: { in: clientsToDelete }
      }
    })
    console.log(`  ✅ ${clientsToDelete.length} clients supprimés`)
    console.log(`  ✅ 50 clients conservés`)
  } else {
    console.log(`  ✅ Déjà ${allClients.length} clients (OK)`)
  }

  // 2. STOCK - Garder seulement 20
  console.log('\n📦 Stock...')
  const allStock = await prisma.stockItem.findMany({
    where: { artisanId: artisan.id },
    orderBy: { createdAt: 'asc' }
  })
  console.log(`  Actuellement: ${allStock.length} items`)
  
  if (allStock.length > 20) {
    const stockToDelete = allStock.slice(20).map(s => s.id)
    await prisma.stockItem.deleteMany({
      where: {
        id: { in: stockToDelete }
      }
    })
    console.log(`  ✅ ${stockToDelete.length} items supprimés`)
    console.log(`  ✅ 20 items conservés`)
  } else {
    console.log(`  ✅ Déjà ${allStock.length} items (OK)`)
  }

  // 3. DEVIS - Garder seulement 40
  console.log('\n📄 Devis...')
  const allQuotes = await prisma.quote.findMany({
    where: { artisanId: artisan.id },
    orderBy: { date: 'asc' }
  })
  console.log(`  Actuellement: ${allQuotes.length} devis`)
  
  if (allQuotes.length > 40) {
    const quotesToDelete = allQuotes.slice(40).map(q => q.id)
    
    // Supprimer d'abord les items de devis
    await prisma.quoteItem.deleteMany({
      where: {
        quoteId: { in: quotesToDelete }
      }
    })
    
    // Puis les devis
    await prisma.quote.deleteMany({
      where: {
        id: { in: quotesToDelete }
      }
    })
    console.log(`  ✅ ${quotesToDelete.length} devis supprimés`)
    console.log(`  ✅ 40 devis conservés`)
  } else {
    console.log(`  ✅ Déjà ${allQuotes.length} devis (OK)`)
  }

  // 4. FACTURES - Garder seulement 60
  console.log('\n💰 Factures...')
  const allInvoices = await prisma.invoice.findMany({
    where: { artisanId: artisan.id },
    orderBy: { date: 'asc' }
  })
  console.log(`  Actuellement: ${allInvoices.length} factures`)
  
  if (allInvoices.length > 60) {
    const invoicesToDelete = allInvoices.slice(60).map(i => i.id)
    
    // Supprimer d'abord les items et reminders
    await prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: { in: invoicesToDelete }
      }
    })
    
    await prisma.invoiceReminder.deleteMany({
      where: {
        invoiceId: { in: invoicesToDelete }
      }
    })
    
    // Puis les factures
    await prisma.invoice.deleteMany({
      where: {
        id: { in: invoicesToDelete }
      }
    })
    console.log(`  ✅ ${invoicesToDelete.length} factures supprimées`)
    console.log(`  ✅ 60 factures conservées`)
  } else {
    console.log(`  ✅ Déjà ${allInvoices.length} factures (OK)`)
  }

  // 5. DÉPENSES - Garder seulement 30
  console.log('\n💸 Dépenses...')
  const allExpenses = await prisma.expense.findMany({
    where: { artisanId: artisan.id },
    orderBy: { date: 'asc' }
  })
  console.log(`  Actuellement: ${allExpenses.length} dépenses`)
  
  if (allExpenses.length > 30) {
    const expensesToDelete = allExpenses.slice(30).map(e => e.id)
    await prisma.expense.deleteMany({
      where: {
        id: { in: expensesToDelete }
      }
    })
    console.log(`  ✅ ${expensesToDelete.length} dépenses supprimées`)
    console.log(`  ✅ 30 dépenses conservées`)
  } else {
    console.log(`  ✅ Déjà ${allExpenses.length} dépenses (OK)`)
  }

  // 6. NOTIFICATIONS - Garder seulement 20
  console.log('\n🔔 Notifications...')
  const allNotifications = await prisma.notification.findMany({
    where: { artisanId: artisan.id },
    orderBy: { createdAt: 'asc' }
  })
  console.log(`  Actuellement: ${allNotifications.length} notifications`)
  
  if (allNotifications.length > 20) {
    const notificationsToDelete = allNotifications.slice(20).map(n => n.id)
    await prisma.notification.deleteMany({
      where: {
        id: { in: notificationsToDelete }
      }
    })
    console.log(`  ✅ ${notificationsToDelete.length} notifications supprimées`)
    console.log(`  ✅ 20 notifications conservées`)
  } else {
    console.log(`  ✅ Déjà ${allNotifications.length} notifications (OK)`)
  }

  // 7. INTERVENTIONS - Afficher le compte (pas de limite stricte car dépend du calendrier)
  console.log('\n🔧 Interventions...')
  const allInterventions = await prisma.intervention.findMany({
    where: { artisanId: artisan.id }
  })
  console.log(`  Total: ${allInterventions.length} interventions (max 4 par jour)`)

  // Résumé final
  console.log('\n' + '='.repeat(50))
  console.log('✅ RÉDUCTION TERMINÉE')
  console.log('='.repeat(50))
  
  const finalClients = await prisma.client.count({ where: { artisanId: artisan.id } })
  const finalStock = await prisma.stockItem.count({ where: { artisanId: artisan.id } })
  const finalQuotes = await prisma.quote.count({ where: { artisanId: artisan.id } })
  const finalInvoices = await prisma.invoice.count({ where: { artisanId: artisan.id } })
  const finalExpenses = await prisma.expense.count({ where: { artisanId: artisan.id } })
  const finalNotifications = await prisma.notification.count({ where: { artisanId: artisan.id } })
  const finalInterventions = await prisma.intervention.count({ where: { artisanId: artisan.id } })
  
  console.log('\n📊 Résumé final:')
  console.log(`  - ${finalClients} clients`)
  console.log(`  - ${finalStock} items de stock`)
  console.log(`  - ${finalQuotes} devis`)
  console.log(`  - ${finalInvoices} factures`)
  console.log(`  - ${finalExpenses} dépenses`)
  console.log(`  - ${finalNotifications} notifications`)
  console.log(`  - ${finalInterventions} interventions`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la réduction:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

