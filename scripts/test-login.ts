import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing login scenarios...')
  console.log('')

  // Test different email variations
  const testEmail = process.env.TEST_EMAIL || 'test@example.com'
  const testEmails = [
    testEmail,
    testEmail.toLowerCase(),
    testEmail.toUpperCase(),
  ]

  const password = process.env.TEST_PASSWORD || 'testpassword'

  for (const email of testEmails) {
    console.log(`Testing email: ${email}`)
    
    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
      })

      if (user) {
        console.log(`  ✅ User found: ${user.email}`)
        const isValid = await bcrypt.compare(password, user.passwordHash)
        console.log(`  ✅ Password valid: ${isValid}`)
      } else {
        console.log(`  ❌ User not found`)
      }
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`)
    }
    console.log('')
  }

  // Also try finding by any email (case-insensitive search)
  console.log('Testing case-insensitive search...')
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        contains: 'project',
        mode: 'insensitive',
      },
    },
  })
  
  console.log(`Found ${allUsers.length} users with 'project' in email:`)
  allUsers.forEach(u => {
    console.log(`  - ${u.email} (ID: ${u.id})`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

