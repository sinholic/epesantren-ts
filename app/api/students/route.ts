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
          studentStatus: true,
        },
        skip,
        take: limit,
        orderBy: {
          studentId: 'desc',
        },
        include: {
          class: true,
          major: true,
        },
      }),
      prisma.student.count({
        where: {
          studentStatus: true,
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
      studentNis,
      studentNisn,
      studentPassword,
      studentFullName,
      studentGender,
      classClassId,
      majorsMajorsId,
    } = body

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(studentPassword || 'password123', 10)

    const student = await prisma.student.create({
      data: {
        studentNis,
        studentNisn,
        studentPassword: hashedPassword,
        studentFullName,
        studentGender,
        classClassId,
        majorsMajorsId,
        studentStatus: true,
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
