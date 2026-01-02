import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: {
          student_status: true,
        },
        skip,
        take: limit,
        orderBy: {
          student_id: 'desc',
        },
        include: {
          class: true,
          major: true,
        },
      }),
      prisma.student.count({
        where: {
          student_status: true,
        },
      }),
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      student_nis,
      student_nisn,
      student_password,
      student_full_name,
      student_gender,
      class_class_id,
      majors_majors_id,
    } = body

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(student_password || 'password123', 10)

    const student = await prisma.student.create({
      data: {
        student_nis,
        student_nisn,
        student_password: hashedPassword,
        student_full_name,
        student_gender,
        class_class_id,
        majors_majors_id,
        student_status: true,
      },
    })

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
