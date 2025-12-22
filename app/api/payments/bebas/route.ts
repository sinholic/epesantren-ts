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

    const bebasPayments = await prisma.bebas.findMany({
      where,
      include: {
        student: true,
        payment: true,
        bebasPays: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        bebasId: 'desc',
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
      studentStudentId,
      paymentPaymentId,
      bebasBill,
      bebasTotalPay,
    } = body

    const bebas = await prisma.bebas.create({
      data: {
        studentStudentId,
        paymentPaymentId,
        bebasBill: bebasBill ? parseFloat(bebasBill) : null,
        bebasTotalPay: bebasTotalPay ? parseFloat(bebasTotalPay) : 0,
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
