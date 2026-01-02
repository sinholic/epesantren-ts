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
    const period = await prisma.period.findUnique({
      where: { period_id: parseInt(id) },
    })

    if (!period) {
      return NextResponse.json(
        { error: 'Period not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ period })
  } catch (error) {
    console.error('Get period error:', error)
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
    const { period_start, period_end, period_status } = body

    const updateData: any = {}
    if (period_start !== undefined) updateData.period_start = parseInt(period_start)
    if (period_end !== undefined) updateData.period_end = parseInt(period_end)
    if (period_status !== undefined) {
      // If setting as active, deactivate all other periods
      if (period_status === true) {
        await prisma.period.updateMany({
          where: {
            period_status: true,
            period_id: { not: parseInt(id) },
          },
          data: { period_status: false },
        })
      }
      updateData.period_status = period_status
    }

    const period = await prisma.period.update({
      where: { period_id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json({ period })
  } catch (error) {
    console.error('Update period error:', error)
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
    // Check if period has payments
    const payments = await prisma.payment.count({
      where: { period_period_id: parseInt(id) },
    })

    if (payments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete period with existing payments' },
        { status: 400 }
      )
    }

    await prisma.period.delete({
      where: { period_id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete period error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
