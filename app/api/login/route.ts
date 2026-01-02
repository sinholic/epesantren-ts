import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { authenticateStudent, generateStudentToken } from '@/lib/auth-student'
import { authenticateTeacher, generateTeacherToken } from '@/lib/auth-teacher'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Try to authenticate as Admin (using email)
    let user = await authenticateUser(username, password)
    if (user) {
      const token = generateToken(user)
      const cookieStore = await cookies()
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({
        success: true,
        role: 'admin',
        redirect: '/manage/dashboard',
        user: {
          userId: user.user_id,
          email: user.user_email,
          fullName: user.user_full_name,
          roleId: user.user_role_role_id,
        },
        token,
      })
    }

    // Try to authenticate as Student (using NIS)
    let student = await authenticateStudent(username, password)
    if (student) {
      const token = generateStudentToken(student)
      const cookieStore = await cookies()
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({
        success: true,
        role: 'student',
        redirect: '/student/dashboard',
        user: {
          studentId: student.student_id,
          nis: student.student_nis,
          fullName: student.student_full_name,
        },
        token,
      })
    }

    // Try to authenticate as Teacher (using NIP)
    let teacher = await authenticateTeacher(username, password)
    if (teacher) {
      const token = generateTeacherToken(teacher)
      const cookieStore = await cookies()
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({
        success: true,
        role: 'teacher',
        redirect: '/teacher/dashboard',
        user: {
          employeeId: teacher.employeeId,
          nip: teacher.nip,
          fullName: teacher.employeeFullName,
        },
        token,
      })
    }

    // All authentication attempts failed
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
