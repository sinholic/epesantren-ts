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

    const bebasPayments = await prisma.bebas.findMany({
      where,
      include: {
        student: true,
        payment: true,
        bebas_pays: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        bebas_id: 'desc',
      },
    })

    return NextResponse.json({ payments: bebasPayments })
  } catch (error) {
    console.error('Get bebas payments error:', error)
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
      bebas_bill,
      bebas_total_pay,
    } = body

    const bebas = await prisma.bebas.create({
      data: {
        student_student_id,
        payment_payment_id,
        bebas_bill: bebas_bill ? parseFloat(bebas_bill) : null,
        bebas_total_pay: bebas_total_pay ? parseFloat(bebas_total_pay) : 0,
      },
    })

    return NextResponse.json({ payment: bebas }, { status: 201 })
  } catch (error) {
    console.error('Create bebas payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
