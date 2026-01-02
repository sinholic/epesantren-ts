import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface StudentAuth {
  studentId: number
  studentNis: string | null
  studentFullName: string | null
}

export async function verifyStudentPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Support legacy SHA1 passwords for backward compatibility
  if (hashedPassword.length === 40 && /^[a-f0-9]{40}$/i.test(hashedPassword)) {
    const crypto = await import('crypto')
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex')
    return sha1Hash === hashedPassword
  }
  return bcrypt.compare(password, hashedPassword)
}

export async function hashStudentPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function upgradeStudentPassword(studentId: number, password: string): Promise<void> {
  const hashedPassword = await hashStudentPassword(password)
  await prisma.student.update({
    where: { studentId },
    data: { studentPassword: hashedPassword },
  })
}

export function generateStudentToken(student: StudentAuth): string {
  return jwt.sign(
    {
      studentId: student.studentId,
      nis: student.studentNis,
      type: 'student',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyStudentToken(token: string): StudentAuth | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.type !== 'student') return null
    return {
      studentId: decoded.studentId,
      studentNis: decoded.nis,
      studentFullName: null,
    }
  } catch (error) {
    return null
  }
}

export async function authenticateStudent(nis: string, password: string): Promise<StudentAuth | null> {
  try {
    const student = await prisma.student.findFirst({
      where: {
        studentNis: nis,
        studentStatus: true,
      },
    })

    if (!student || !student.studentPassword) {
      return null
    }

    const isValid = await verifyStudentPassword(password, student.studentPassword)
    if (!isValid) {
      return null
    }

    // Upgrade password if it was SHA1
    if (student.studentPassword.length === 40 && /^[a-f0-9]{40}$/i.test(student.studentPassword)) {
      try {
        await upgradeStudentPassword(student.studentId, password)
      } catch (error) {
        // Log error but don't fail authentication if password upgrade fails
        console.error('Failed to upgrade student password:', error)
      }
    }

    return {
      studentId: student.studentId,
      studentNis: student.studentNis,
      studentFullName: student.studentFullName,
    }
  } catch (error) {
    console.error('Database error in authenticateStudent:', error)
    throw new Error(`Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
