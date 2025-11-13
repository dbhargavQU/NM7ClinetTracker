import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma for PgBouncer (transaction pooler)
// PgBouncer doesn't support prepared statements, so we need to disable them
const prismaClientOptions: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

// If using PgBouncer (pooler), disable prepared statements
if (process.env.DATABASE_URL?.includes('pooler') || process.env.DATABASE_URL?.includes('pgbouncer')) {
  prismaClientOptions.datasources = {
    db: {
      url: process.env.DATABASE_URL?.includes('?')
        ? `${process.env.DATABASE_URL}&pgbouncer=true`
        : `${process.env.DATABASE_URL}?pgbouncer=true`,
    },
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

