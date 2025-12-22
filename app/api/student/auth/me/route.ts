import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentToken } from '@/lib/auth-student'
import { prisma } from '@/lib/prisma'
import { getAuthToken } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('student_token')?.value || getAuthToken(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentAuth = verifyStudentToken(token)
    if (!studentAuth) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { studentId: studentAuth.studentId },
      include: {
        class: true,
        major: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      student: {
        studentId: student.studentId,
        nis: student.studentNis,
        nisn: student.studentNisn,
        fullName: student.studentFullName,
        gender: student.studentGender,
        img: student.studentImg,
        class: student.class,
        major: student.major,
      },
    })
  } catch (error) {
    console.error('Get student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
