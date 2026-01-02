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
      where: { student_id: studentAuth.student_id },
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
        studentId: student.student_id,
        nis: student.student_nis,
        nisn: student.student_nisn,
        fullName: student.student_full_name,
        gender: student.student_gender,
        img: student.student_img,
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
