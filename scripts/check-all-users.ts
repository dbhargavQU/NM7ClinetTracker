import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 All users in production database:')
  console.log('')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (users.length === 0) {
    console.log('❌ No users found in database!')
    console.log('   You need to run: npm run db:seed')
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })
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

