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
      where.student_student_id = parseInt(studentId)
    }
    if (paymentId) {
      where.payment_payment_id = parseInt(paymentId)
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
        bulan_id: 'desc',
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
      student_student_id,
      payment_payment_id,
      month_month_id,
      bulan_bill,
      bulan_status,
      bulan_number_pay,
      bulan_date_pay,
      user_user_id,
    } = body

    const bulan = await prisma.bulan.create({
      data: {
        student_student_id,
        payment_payment_id,
        month_month_id,
        bulan_bill: bulan_bill ? parseFloat(bulan_bill) : null,
        bulan_status: bulan_status || false,
        bulan_number_pay,
        bulan_date_pay: bulan_date_pay ? new Date(bulan_date_pay) : null,
        user_user_id,
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
