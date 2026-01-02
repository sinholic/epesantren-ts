import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { student_id: parseInt(id) },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      student_nis,
      student_nisn,
      student_full_name,
      student_gender,
      class_class_id,
      majors_majors_id,
      student_status,
    } = body

    const updateData: any = {}
    if (student_nis !== undefined) updateData.student_nis = student_nis
    if (student_nisn !== undefined) updateData.student_nisn = student_nisn
    if (student_full_name !== undefined) updateData.student_full_name = student_full_name
    if (student_gender !== undefined) updateData.student_gender = student_gender
    if (class_class_id !== undefined) updateData.class_class_id = class_class_id
    if (majors_majors_id !== undefined) updateData.majors_majors_id = majors_majors_id
    if (student_status !== undefined) updateData.student_status = student_status

    const student = await prisma.student.update({
      where: { student_id: parseInt(id) },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    await prisma.student.update({
      where: { student_id: parseInt(id) },
      data: { student_status: false },
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
