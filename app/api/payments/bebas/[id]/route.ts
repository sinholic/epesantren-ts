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
      where: { bebas_id: parseInt(id) },
      include: {
        student: true,
        payment: true,
        bebas_pays: {
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
      student_student_id,
      payment_payment_id,
      bebas_bill,
      bebas_total_pay,
    } = body

    const updateData: any = {}
    if (student_student_id !== undefined) updateData.student_student_id = student_student_id
    if (payment_payment_id !== undefined) updateData.payment_payment_id = payment_payment_id
    if (bebas_bill !== undefined) updateData.bebas_bill = parseFloat(bebas_bill)
    if (bebas_total_pay !== undefined) updateData.bebas_total_pay = parseFloat(bebas_total_pay)

    updateData.bebas_last_update = new Date()

    const bebas = await prisma.bebas.update({
      where: { bebas_id: parseInt(id) },
      data: updateData,
      include: {
        student: true,
        payment: true,
        bebas_pays: {
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
      where: { bebas_bebas_id: parseInt(id) },
    })

    if (bebasPays > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bebas payment with existing payment records' },
        { status: 400 }
      )
    }

    await prisma.bebas.delete({
      where: { bebas_id: parseInt(id) },
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
