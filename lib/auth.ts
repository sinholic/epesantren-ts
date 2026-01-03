import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface AuthUser {
  user_id: number
  username: string | null
  user_email: string | null
  user_full_name: string | null
  user_role_role_id: number | null
  user_role_type: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Support legacy SHA1 passwords for backward compatibility
  if (hashedPassword.length === 40 && /^[a-f0-9]{40}$/i.test(hashedPassword)) {
    // Legacy SHA1 password
    const crypto = await import('crypto')
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex')
    if (sha1Hash === hashedPassword) {
      // Password matches, but we should upgrade it
      return true
    }
    return false
  }
  // Modern bcrypt password
  return bcrypt.compare(password, hashedPassword)
}

export async function upgradePassword(user_id: number, password: string): Promise<void> {
  const hashedPassword = await hashPassword(password)
  await prisma.user.update({
    where: { user_id },
    data: { user_password: hashedPassword },
  })
}

export function generateToken(user: AuthUser, expiresIn: string = '7d'): string {
  return jwt.sign(
    {
      userId: user.user_id,
      username: user.username,
      email: user.user_email,
      roleId: user.user_role_role_id,
      roleType: user.user_role_type,
    },
    JWT_SECRET,
    { expiresIn }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      user_id: decoded.userId,
      username: decoded.username,
      user_email: decoded.email,
      user_full_name: null,
      user_role_role_id: decoded.roleId,
      user_role_type: decoded.roleType,
    }
  } catch (error) {
    return null
  }
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        user_is_deleted: false,
      },
      include: {
        role: true,
      },
    })

    if (!user || !user.user_password) {
      return null
    }

    const isValid = await verifyPassword(password, user.user_password)
    if (!isValid) {
      return null
    }

    // Upgrade password if it was SHA1
    if (user.user_password.length === 40 && /^[a-f0-9]{40}$/i.test(user.user_password)) {
      try {
        await upgradePassword(user.user_id, password)
      } catch (error) {
        // Log error but don't fail authentication if password upgrade fails
        console.error('Failed to upgrade password:', error)
      }
    }

    return {
      user_id: user.user_id,
      username: user.username,
      user_email: user.user_email,
      user_full_name: user.user_full_name,
      user_role_role_id: user.user_role_role_id,
      user_role_type: user.user_role_type,
    }
  } catch (error) {
    console.error('Database error in authenticateUser:', error)
    throw new Error(`Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
