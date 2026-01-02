import { PrismaClient } from '@prisma/client'
import { PrismaMariaDB } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: mariadb.Pool | undefined
}

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
}

// Parse DATABASE_URL to get connection details for MariaDB
function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Parse mysql://user:password@host:port/database
  // MariaDB uses mysql:// protocol in connection string
  const url = new URL(databaseUrl.replace(/^mysql:\/\//, 'http://'))
  const host = url.hostname
  const port = url.port ? parseInt(url.port) : 3306
  const user = url.username
  const password = decodeURIComponent(url.password)
  const database = url.pathname.slice(1) // Remove leading '/'

  return {
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  }
}

// Create MariaDB connection pool (singleton)
let pool: mariadb.Pool
if (!globalForPrisma.pool) {
  const connectionConfig = getConnectionConfig()
  pool = mariadb.createPool(connectionConfig)
  globalForPrisma.pool = pool
} else {
  pool = globalForPrisma.pool
}

// Create Prisma MariaDB adapter
const adapter = new PrismaMariaDB(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
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
