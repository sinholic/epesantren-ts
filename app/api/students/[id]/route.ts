import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { studentId: parseInt(params.id) },
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

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Get student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      studentFullName,
      studentGender,
      classClassId,
      majorsMajorsId,
      studentStatus,
    } = body

    const updateData: any = {}
    if (studentNis !== undefined) updateData.studentNis = studentNis
    if (studentNisn !== undefined) updateData.studentNisn = studentNisn
    if (studentFullName !== undefined) updateData.studentFullName = studentFullName
    if (studentGender !== undefined) updateData.studentGender = studentGender
    if (classClassId !== undefined) updateData.classClassId = classClassId
    if (majorsMajorsId !== undefined) updateData.majorsMajorsId = majorsMajorsId
    if (studentStatus !== undefined) updateData.studentStatus = studentStatus

    const student = await prisma.student.update({
      where: { studentId: parseInt(params.id) },
      data: updateData,
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.student.update({
      where: { studentId: parseInt(params.id) },
      data: { studentStatus: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
