// Test des différents formats d'URL
const formats = [
  'postgresql://postgres:Houcine78!@db.tqvdjfesnavnsqchufjg.supabase.co:5432/postgres',
  'postgresql://postgres:Houcine78%21@db.tqvdjfesnavnsqchufjg.supabase.co:5432/postgres',
  'postgres://postgres:Houcine78!@db.tqvdjfesnavnsqchufjg.supabase.co:5432/postgres',
  'postgres://postgres:Houcine78%21@db.tqvdjfesnavnsqchufjg.supabase.co:5432/postgres',
]

console.log('Test des formats d\'URL:\n')

formats.forEach((url, index) => {
  console.log(`Format ${index + 1}:`)
  console.log(url)
  
  try {
    const urlObj = new URL(url)
    console.log('✅ URL valide')
    console.log('  Host:', urlObj.hostname)
    console.log('  Port:', urlObj.port)
    console.log('  Path:', urlObj.pathname)
    console.log('  User:', urlObj.username)
    console.log('  Password:', urlObj.password ? '***' : 'none')
  } catch (error) {
    console.log('❌ URL invalide:', error.message)
  }
  console.log('')
})

