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

    const period = await prisma.period.findUnique({
      where: { periodId: parseInt(params.id) },
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
    const { periodStart, periodEnd, periodStatus } = body

    const updateData: any = {}
    if (periodStart !== undefined) updateData.periodStart = parseInt(periodStart)
    if (periodEnd !== undefined) updateData.periodEnd = parseInt(periodEnd)
    if (periodStatus !== undefined) {
      // If setting as active, deactivate all other periods
      if (periodStatus === true) {
        await prisma.period.updateMany({
          where: {
            periodStatus: true,
            periodId: { not: parseInt(params.id) },
          },
          data: { periodStatus: false },
        })
      }
      updateData.periodStatus = periodStatus
    }

    const period = await prisma.period.update({
      where: { periodId: parseInt(params.id) },
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

    // Check if period has payments
    const payments = await prisma.payment.count({
      where: { periodPeriodId: parseInt(params.id) },
    })

    if (payments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete period with existing payments' },
        { status: 400 }
      )
    }

    await prisma.period.delete({
      where: { periodId: parseInt(params.id) },
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
