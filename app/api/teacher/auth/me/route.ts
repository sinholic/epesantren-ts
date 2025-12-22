import { NextRequest, NextResponse } from 'next/server'
import { verifyTeacherToken } from '@/lib/auth-teacher'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('teacher_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teacher = verifyTeacherToken(token)
    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get full teacher data from database
    const employees = await prisma.$queryRaw<any[]>`
      SELECT * FROM employee 
      WHERE employee_id = ${teacher.employeeId} OR id = ${teacher.employeeId}
      LIMIT 1
    `

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    const employeeData = employees[0]

    return NextResponse.json({
      teacher: {
        employeeId: employeeData.employee_id || employeeData.id,
        nip: employeeData.nip,
        employeeFullName: employeeData.employee_full_name || employeeData.name,
        employeeStatus: employeeData.employee_status || employeeData.active,
      },
    })
  } catch (error) {
    console.error('Get Teacher user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
