import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TeacherAuth {
  employeeId: number
  nip: string | null
  employeeFullName: string | null
}

export async function verifyTeacherPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Support legacy SHA1 passwords for backward compatibility
  if (hashedPassword.length === 40 && /^[a-f0-9]{40}$/i.test(hashedPassword)) {
    const crypto = await import('crypto')
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex')
    return sha1Hash === hashedPassword
  }
  return bcrypt.compare(password, hashedPassword)
}

export async function hashTeacherPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function upgradeTeacherPassword(employeeId: number, password: string): Promise<void> {
  const hashedPassword = await hashTeacherPassword(password)
  // Note: Using raw query since employee table might use different password field name
  await prisma.$executeRaw`
    UPDATE employee 
    SET password = ${hashedPassword} 
    WHERE employee_id = ${employeeId}
  `
}

export function generateTeacherToken(teacher: TeacherAuth): string {
  return jwt.sign(
    {
      employeeId: teacher.employeeId,
      nip: teacher.nip,
      type: 'teacher',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyTeacherToken(token: string): TeacherAuth | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.type !== 'teacher') return null
    return {
      employeeId: decoded.employeeId,
      nip: decoded.nip,
      employeeFullName: null,
    }
  } catch (error) {
    return null
  }
}

export async function authenticateTeacher(nip: string, password: string): Promise<TeacherAuth | null> {
  // Note: Using raw query since employee table structure might vary
  const employees = await prisma.$queryRaw<any[]>`
    SELECT * FROM employee 
    WHERE nip = ${nip} 
    AND employee_status = 1
    LIMIT 1
  `

  if (!employees || employees.length === 0) {
    return null
  }

  const employee = employees[0]
  // Try both password field names
  const passwordField = employee.password || employee.employee_password
  if (!passwordField) {
    return null
  }

  const isValid = await verifyTeacherPassword(password, passwordField)
  if (!isValid) {
    return null
  }

  // Upgrade password if it was SHA1
  if (passwordField.length === 40 && /^[a-f0-9]{40}$/i.test(passwordField)) {
    await upgradeTeacherPassword(employee.employee_id || employee.id, password)
  }

  return {
    employeeId: employee.employee_id || employee.id,
    nip: employee.nip,
    employeeFullName: employee.employee_full_name || employee.name,
  }
}
