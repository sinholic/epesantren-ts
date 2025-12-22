import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const paymentId = searchParams.get('paymentId')

    const where: any = {}
    if (studentId) {
      where.studentStudentId = parseInt(studentId)
    }
    if (paymentId) {
      where.paymentPaymentId = parseInt(paymentId)
    }

    const bulanPayments = await prisma.bulan.findMany({
      where,
      include: {
        student: true,
        payment: true,
        month: true,
        user: true,
      },
      orderBy: {
        bulanId: 'desc',
      },
    })

    return NextResponse.json({ payments: bulanPayments })
  } catch (error) {
    console.error('Get bulan payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const bulan = await prisma.bulan.create({
      data: {
        studentStudentId,
        paymentPaymentId,
        monthMonthId,
        bulanBill: bulanBill ? parseFloat(bulanBill) : null,
        bulanStatus: bulanStatus || false,
        bulanNumberPay,
        bulanDatePay: bulanDatePay ? new Date(bulanDatePay) : null,
        userUserId,
      },
    })

    return NextResponse.json({ payment: bulan }, { status: 201 })
  } catch (error) {
    console.error('Create bulan payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
