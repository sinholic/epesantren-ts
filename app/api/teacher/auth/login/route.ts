import { NextRequest, NextResponse } from 'next/server'
import { authenticateTeacher, generateTeacherToken } from '@/lib/auth-teacher'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nip, password } = body

    if (!nip || !password) {
      return NextResponse.json(
        { error: 'NIP and password are required' },
        { status: 400 }
      )
    }

    const teacher = await authenticateTeacher(nip, password)
    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateTeacherToken(teacher)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('teacher_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      teacher: {
        employeeId: teacher.employeeId,
        nip: teacher.nip,
        employeeFullName: teacher.employeeFullName,
      },
      token,
    })
  } catch (error) {
    console.error('Teacher Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
