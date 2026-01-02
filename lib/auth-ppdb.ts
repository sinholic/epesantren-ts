import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface PPDBAuth {
  participant_id: number
  nisn: string | null
  nama_peserta: string | null
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

export async function upgradePPDBPassword(participant_id: number, password: string): Promise<void> {
  const hashedPassword = await hashPPDBPassword(password)
  await prisma.pPDBParticipant.update({
    where: { id: participant_id },
    data: { password: hashedPassword },
  })
}

export function generatePPDBToken(participant: PPDBAuth): string {
  return jwt.sign(
    {
      participantId: participant.participant_id,
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
      participant_id: decoded.participantId,
      nisn: decoded.nisn,
      nama_peserta: null,
    }
  } catch (error) {
    return null
  }
}

export async function authenticatePPDB(nisn: string, password: string): Promise<PPDBAuth | null> {
  try {
    const participant = await prisma.pPDBParticipant.findFirst({
      where: {
        nisn: nisn,
      },
    })

    if (!participant || !participant.password) {
      return null
    }

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
      participant_id: participant.id,
      nisn: participant.nisn,
      nama_peserta: participant.nama_peserta,
    }
  } catch (error) {
    console.error('Database error in authenticatePPDB:', error)
    throw new Error(`Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
