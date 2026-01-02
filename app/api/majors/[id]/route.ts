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
    const major = await prisma.major.findUnique({
      where: { majors_id: parseInt(id) },
    })

    if (!major) {
      return NextResponse.json(
        { error: 'Major not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ major })
  } catch (error) {
    console.error('Get major error:', error)
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
    const { majors_name, majors_short_name } = body

    const updateData: any = {}
    if (majors_name !== undefined) updateData.majors_name = majors_name
    if (majors_short_name !== undefined) updateData.majors_short_name = majors_short_name

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const major = await prisma.major.update({
      where: { majors_id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json({ major })
  } catch (error) {
    console.error('Update major error:', error)
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
    // Check if major has students
    const students = await prisma.student.count({
      where: { majors_majors_id: parseInt(id) },
    })

    if (students > 0) {
      return NextResponse.json(
        { error: 'Cannot delete major with existing students' },
        { status: 400 }
      )
    }

    await prisma.major.delete({
      where: { majors_id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete major error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
