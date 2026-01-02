import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
}

// Create Prisma Client for MariaDB
// Note: Prisma 6.0.0 supports MySQL/MariaDB natively via connection string
// The MariaDB adapter (@prisma/adapter-mariadb) may have compatibility issues with Prisma 6.0.0
// Using native MySQL support works reliably with MariaDB as they share the same protocol
// Connection string format: mysql://user:password@host:port/database
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

// Test connection on initialization
if (!globalForPrisma.prisma) {
  prisma.$connect().catch((error) => {
    console.error('Failed to connect to MariaDB database:', error)
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set')
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
