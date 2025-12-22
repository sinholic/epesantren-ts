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

    const major = await prisma.major.findUnique({
      where: { majorsId: parseInt(params.id) },
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
    const { majorsName, majorsShortName } = body

    const updateData: any = {}
    if (majorsName !== undefined) updateData.majorsName = majorsName
    if (majorsShortName !== undefined) updateData.majorsShortName = majorsShortName

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const major = await prisma.major.update({
      where: { majorsId: parseInt(params.id) },
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

    // Check if major has students
    const students = await prisma.student.count({
      where: { majorsMajorsId: parseInt(params.id) },
    })

    if (students > 0) {
      return NextResponse.json(
        { error: 'Cannot delete major with existing students' },
        { status: 400 }
      )
    }

    await prisma.major.delete({
      where: { majorsId: parseInt(params.id) },
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
