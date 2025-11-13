import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Get credentials from environment or use defaults for testing
  const email = process.env.TEST_EMAIL || 'test@example.com'
  const password = process.env.TEST_PASSWORD || 'testpassword'

  console.log('🔍 Checking user account...')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('')

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email },
  })

  if (!user) {
    console.log('❌ User not found!')
    console.log('')
    console.log('Available users in database:')
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true },
    })
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.name})`))
    return
  }

  console.log('✅ User found!')
  console.log(`   ID: ${user.id}`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log('')

  // Test password
  console.log('🔐 Testing password...')
  const isValid = await bcrypt.compare(password, user.passwordHash)
  
  if (isValid) {
    console.log('✅ Password is correct!')
  } else {
    console.log('❌ Password does not match!')
    console.log('')
    console.log('Testing with different case variations...')
    
    // Try different case variations
    const variations = [
      email,
      email.toLowerCase(),
      email.toUpperCase(),
      email.charAt(0).toUpperCase() + email.slice(1).toLowerCase(),
    ]
    
    for (const testEmail of variations) {
      const testUser = await prisma.user.findUnique({
        where: { email: testEmail },
      })
      if (testUser) {
        console.log(`   Found user with email: ${testEmail}`)
        const testValid = await bcrypt.compare(password, testUser.passwordHash)
        console.log(`   Password match: ${testValid}`)
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

