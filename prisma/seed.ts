import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo trainer
  const passwordHash = await bcrypt.hash('password123', 10)
  
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@example.com' },
    update: {},
    create: {
      email: 'trainer@example.com',
      name: 'Demo Trainer',
      passwordHash,
    },
  })

  console.log('✅ Created trainer:', trainer.email)

  // Create demo clients
  const client1 = await prisma.client.create({
    data: {
      userId: trainer.id,
      name: 'John Doe',
      startDate: new Date('2024-01-15'),
      monthlyFee: 150.00,
      isActive: true,
      startingWeightKg: 85.5,
      notes: 'Focus on strength training',
    },
  })

  const client2 = await prisma.client.create({
    data: {
      userId: trainer.id,
      name: 'Jane Smith',
      startDate: new Date('2024-02-01'),
      monthlyFee: 200.00,
      isActive: true,
      startingWeightKg: 65.0,
      notes: 'Cardio and flexibility focus',
    },
  })

  console.log('✅ Created clients')

  // Create workout schedules
  await prisma.workoutSchedule.createMany({
    data: [
      {
        clientId: client1.id,
        dayOfWeek: 1, // Monday
        startTime: '07:00',
        endTime: '08:00',
        location: 'Gym A',
      },
      {
        clientId: client1.id,
        dayOfWeek: 3, // Wednesday
        startTime: '07:00',
        endTime: '08:00',
        location: 'Gym A',
      },
      {
        clientId: client2.id,
        dayOfWeek: 2, // Tuesday
        startTime: '18:00',
        endTime: '19:00',
        location: 'Gym B',
      },
      {
        clientId: client2.id,
        dayOfWeek: 4, // Thursday
        startTime: '18:00',
        endTime: '19:00',
        location: 'Gym B',
      },
    ],
  })

  console.log('✅ Created workout schedules')

  // Create payments
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  await prisma.payment.createMany({
    data: [
      {
        clientId: client1.id,
        month: currentMonth - 1 || 12,
        year: currentMonth === 1 ? currentYear - 1 : currentYear,
        amount: 150.00,
        paidOn: new Date(),
      },
      {
        clientId: client1.id,
        month: currentMonth,
        year: currentYear,
        amount: 150.00,
        paidOn: new Date(),
      },
      {
        clientId: client2.id,
        month: currentMonth - 1 || 12,
        year: currentMonth === 1 ? currentYear - 1 : currentYear,
        amount: 200.00,
        paidOn: new Date(),
      },
      // client2 has NOT paid this month (for demo)
    ],
  })

  console.log('✅ Created payments')

  // Create progress entries
  await prisma.progressEntry.createMany({
    data: [
      {
        clientId: client1.id,
        date: new Date('2024-01-15'),
        weightKg: 85.5,
        notes: 'Starting weight',
      },
      {
        clientId: client1.id,
        date: new Date('2024-02-15'),
        weightKg: 83.2,
        notes: 'Good progress',
      },
      {
        clientId: client1.id,
        date: new Date('2024-03-15'),
        weightKg: 81.0,
        notes: 'Maintaining consistency',
      },
      {
        clientId: client2.id,
        date: new Date('2024-02-01'),
        weightKg: 65.0,
        notes: 'Starting weight',
      },
      {
        clientId: client2.id,
        date: new Date('2024-03-01'),
        weightKg: 63.5,
        notes: 'Great dedication',
      },
    ],
  })

  console.log('✅ Created progress entries')
  console.log('🎉 Seed completed!')
  console.log('\n📧 Login credentials:')
  console.log('   Email: trainer@example.com')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

