import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface PPDBAuth {
  participantId: number
  nisn: string | null
  namaPeserta: string | null
}

export async function verifyPPDBPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Support legacy SHA1 passwords for backward compatibility
  if (hashedPassword.length === 40 && /^[a-f0-9]{40}$/i.test(hashedPassword)) {
    const crypto = await import('crypto')
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex')
    return sha1Hash === hashedPassword
  }
  return bcrypt.compare(password, hashedPassword)
}

export async function hashPPDBPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function upgradePPDBPassword(participantId: number, password: string): Promise<void> {
  const hashedPassword = await hashPPDBPassword(password)
  // Note: This assumes ppdb_participant table exists
  // You may need to add this to Prisma schema if not already there
  await prisma.$executeRaw`
    UPDATE ppdb_participant 
    SET password = ${hashedPassword} 
    WHERE id = ${participantId}
  `
}

export function generatePPDBToken(participant: PPDBAuth): string {
  return jwt.sign(
    {
      participantId: participant.participantId,
      nisn: participant.nisn,
      type: 'ppdb',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyPPDBToken(token: string): PPDBAuth | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.type !== 'ppdb') return null
    return {
      participantId: decoded.participantId,
      nisn: decoded.nisn,
      namaPeserta: null,
    }
  } catch (error) {
    return null
  }
}

export async function authenticatePPDB(nisn: string, password: string): Promise<PPDBAuth | null> {
  try {
    // Note: Using raw query since ppdb_participant might not be in Prisma schema yet
    const participants = await prisma.$queryRaw<any[]>`
      SELECT * FROM ppdb_participant 
      WHERE nisn = ${nisn} 
      AND status = 1
      LIMIT 1
    `

    if (!participants || participants.length === 0 || !participants[0].password) {
      return null
    }

    const participant = participants[0]
    const isValid = await verifyPPDBPassword(password, participant.password)
    if (!isValid) {
      return null
    }

    // Upgrade password if it was SHA1
    if (participant.password.length === 40 && /^[a-f0-9]{40}$/i.test(participant.password)) {
      try {
        await upgradePPDBPassword(participant.id, password)
      } catch (error) {
        // Log error but don't fail authentication if password upgrade fails
        console.error('Failed to upgrade PPDB password:', error)
      }
    }

    return {
      participantId: participant.id,
      nisn: participant.nisn,
      namaPeserta: participant.nama_peserta,
    }
  } catch (error) {
    console.error('Database error in authenticatePPDB:', error)
    throw new Error(`Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
