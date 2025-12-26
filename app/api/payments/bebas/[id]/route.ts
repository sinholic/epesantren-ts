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
    const bebas = await prisma.bebas.findUnique({
      where: { bebasId: parseInt(id) },
      include: {
        student: true,
        payment: true,
        bebasPays: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!bebas) {
      return NextResponse.json(
        { error: 'Bebas payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ payment: bebas })
  } catch (error) {
    console.error('Get bebas payment error:', error)
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
    const {
      studentStudentId,
      paymentPaymentId,
      bebasBill,
      bebasTotalPay,
    } = body

    const updateData: any = {}
    if (studentStudentId !== undefined) updateData.studentStudentId = studentStudentId
    if (paymentPaymentId !== undefined) updateData.paymentPaymentId = paymentPaymentId
    if (bebasBill !== undefined) updateData.bebasBill = parseFloat(bebasBill)
    if (bebasTotalPay !== undefined) updateData.bebasTotalPay = parseFloat(bebasTotalPay)

    updateData.bebasLastUpdate = new Date()

    const bebas = await prisma.bebas.update({
      where: { bebasId: parseInt(id) },
      data: updateData,
      include: {
        student: true,
        payment: true,
        bebasPays: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({ payment: bebas })
  } catch (error) {
    console.error('Update bebas payment error:', error)
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
    // Check if bebas has payments
    const bebasPays = await prisma.bebasPay.count({
      where: { bebasBebasId: parseInt(id) },
    })

    if (bebasPays > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bebas payment with existing payment records' },
        { status: 400 }
      )
    }

    await prisma.bebas.delete({
      where: { bebasId: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete bebas payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
