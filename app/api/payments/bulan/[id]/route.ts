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

    const bulan = await prisma.bulan.findUnique({
      where: { bulanId: parseInt(params.id) },
      include: {
        student: true,
        payment: true,
        month: true,
        user: true,
      },
    })

    if (!bulan) {
      return NextResponse.json(
        { error: 'Bulan payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ payment: bulan })
  } catch (error) {
    console.error('Get bulan payment error:', error)
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
      studentStudentId,
      paymentPaymentId,
      monthMonthId,
      bulanBill,
      bulanStatus,
      bulanNumberPay,
      bulanDatePay,
      userUserId,
    } = body

    const updateData: any = {}
    if (studentStudentId !== undefined) updateData.studentStudentId = studentStudentId
    if (paymentPaymentId !== undefined) updateData.paymentPaymentId = paymentPaymentId
    if (monthMonthId !== undefined) updateData.monthMonthId = monthMonthId
    if (bulanBill !== undefined) updateData.bulanBill = parseFloat(bulanBill)
    if (bulanStatus !== undefined) updateData.bulanStatus = bulanStatus
    if (bulanNumberPay !== undefined) updateData.bulanNumberPay = bulanNumberPay
    if (bulanDatePay !== undefined) updateData.bulanDatePay = new Date(bulanDatePay)
    if (userUserId !== undefined) updateData.userUserId = userUserId

    updateData.bulanLastUpdate = new Date()

    const bulan = await prisma.bulan.update({
      where: { bulanId: parseInt(params.id) },
      data: updateData,
      include: {
        student: true,
        payment: true,
        month: true,
        user: true,
      },
    })

    return NextResponse.json({ payment: bulan })
  } catch (error) {
    console.error('Update bulan payment error:', error)
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

    await prisma.bulan.delete({
      where: { bulanId: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete bulan payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
