import { NextRequest, NextResponse } from 'next/server'
import { authenticateStudent, generateStudentToken } from '@/lib/auth-student'
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

    const { nis, password } = body

    if (!nis || !password) {
      return NextResponse.json(
        { error: 'NIS and password are required' },
        { status: 400 }
      )
    }

    // Authenticate student
    let student
    try {
      student = await authenticateStudent(nis, password)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    let token
    try {
      token = generateStudentToken(student)
    } catch (error) {
      console.error('Token generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // Set cookie
    try {
      const cookieStore = await cookies()
      cookieStore.set('student_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    } catch (error) {
      console.error('Cookie setting error:', error)
      // Continue even if cookie setting fails, token is still returned in response
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
