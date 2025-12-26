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
    const pos = await prisma.pos.findUnique({
      where: { posId: parseInt(id) },
    })

    if (!pos) {
      return NextResponse.json(
        { error: 'POS not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ pos })
  } catch (error) {
    console.error('Get POS error:', error)
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
    const { posName, posDescription } = body

    const updateData: any = {}
    if (posName !== undefined) updateData.posName = posName
    if (posDescription !== undefined) updateData.posDescription = posDescription

    const pos = await prisma.pos.update({
      where: { posId: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json({ pos })
  } catch (error) {
    console.error('Update POS error:', error)
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
    // Check if POS has payments
    const payments = await prisma.payment.count({
      where: { posPosId: parseInt(id) },
    })

    if (payments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete POS with existing payments' },
        { status: 400 }
      )
    }

    await prisma.pos.delete({
      where: { posId: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete POS error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
