import { NextRequest, NextResponse } from 'next/server'
import { authenticateStudent, generateStudentToken } from '@/lib/auth-student'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nis, password } = body

    if (!nis || !password) {
      return NextResponse.json(
        { error: 'NIS and password are required' },
        { status: 400 }
      )
    }

    const student = await authenticateStudent(nis, password)
    if (!student) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateStudentToken(student)

    const cookieStore = await cookies()
    cookieStore.set('student_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      student: {
        studentId: student.studentId,
        nis: student.studentNis,
        fullName: student.studentFullName,
      },
      token,
    })
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
