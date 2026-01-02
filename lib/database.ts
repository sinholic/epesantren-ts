/**
 * Database connection utility
 * Handles DATABASE_URL parsing and URL encoding for passwords with special characters
 */

/**
 * Parse and validate DATABASE_URL
 * Automatically handles URL encoding for passwords with special characters
 */
export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  try {
    // Parse the URL
    const url = new URL(databaseUrl)

    // If password contains special characters, it might not be properly encoded
    // Reconstruct the URL with proper encoding
    const username = url.username
    const password = url.password
    const hostname = url.hostname
    const port = url.port
    const pathname = url.pathname
    const search = url.search

    // Reconstruct URL with proper encoding
    // Encode username and password if they contain special characters
    const encodedUsername = encodeURIComponent(username)
    const encodedPassword = encodeURIComponent(password)

    // Build the connection string
    const protocol = url.protocol.replace(':', '')
    const portPart = port ? `:${port}` : ''
    const pathPart = pathname || ''
    const searchPart = search || ''

    const encodedUrl = `${protocol}://${encodedUsername}:${encodedPassword}@${hostname}${portPart}${pathPart}${searchPart}`

    return encodedUrl
  } catch (error) {
    // If URL parsing fails, it might already be properly formatted
    // Return as-is but log a warning
    console.warn('Failed to parse DATABASE_URL, using as-is:', error)
    return databaseUrl
  }
}

/**
 * Validate DATABASE_URL format
 */
export function validateDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['mysql:', 'postgresql:', 'postgres:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
