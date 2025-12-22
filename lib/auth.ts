import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  userId: number
  userEmail: string | null
  userFullName: string | null
  userRoleRoleId: number | null
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

export async function upgradePassword(userId: number, password: string): Promise<void> {
  const hashedPassword = await hashPassword(password)
  await prisma.user.update({
    where: { userId },
    data: { userPassword: hashedPassword },
  })
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.userEmail,
      roleId: user.userRoleRoleId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      userId: decoded.userId,
      userEmail: decoded.email,
      userFullName: null,
      userRoleRoleId: decoded.roleId,
    }
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      userEmail: email,
      userIsDeleted: false,
    },
  })

  if (!user || !user.userPassword) {
    return null
  }

  const isValid = await verifyPassword(password, user.userPassword)
  if (!isValid) {
    return null
  }

  // Upgrade password if it was SHA1
  if (user.userPassword.length === 40 && /^[a-f0-9]{40}$/i.test(user.userPassword)) {
    await upgradePassword(user.userId, password)
  }

  return {
    userId: user.userId,
    userEmail: user.userEmail,
    userFullName: user.userFullName,
    userRoleRoleId: user.userRoleRoleId,
  }
}
