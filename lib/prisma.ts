import { PrismaClient } from '@prisma/client'
import { getDatabaseUrl } from './database'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get properly encoded DATABASE_URL
let databaseUrl: string
try {
  databaseUrl = getDatabaseUrl()
} catch (error) {
  console.error('Failed to get database URL:', error)
  // Fallback to original DATABASE_URL if helper fails
  databaseUrl = process.env.DATABASE_URL || ''
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set')
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

// Test connection on initialization
if (!globalForPrisma.prisma) {
  prisma.$connect().catch((error) => {
    console.error('Failed to connect to database:', error)
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set')
    console.error('Tip: If your password contains special characters, make sure they are URL-encoded.')
    console.error('See DATABASE_URL_FIX.md for more information.')
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
