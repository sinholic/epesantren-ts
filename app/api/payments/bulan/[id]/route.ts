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
    const bulan = await prisma.bulan.findUnique({
      where: { bulan_id: parseInt(id) },
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
      month_month_id,
      bulan_bill,
      bulan_status,
      bulan_number_pay,
      bulan_date_pay,
      user_user_id,
    } = body

    const updateData: any = {}
    if (student_student_id !== undefined) updateData.student_student_id = student_student_id
    if (payment_payment_id !== undefined) updateData.payment_payment_id = payment_payment_id
    if (month_month_id !== undefined) updateData.month_month_id = month_month_id
    if (bulan_bill !== undefined) updateData.bulan_bill = parseFloat(bulan_bill)
    if (bulan_status !== undefined) updateData.bulan_status = bulan_status
    if (bulan_number_pay !== undefined) updateData.bulan_number_pay = bulan_number_pay
    if (bulan_date_pay !== undefined) updateData.bulan_date_pay = new Date(bulan_date_pay)
    if (user_user_id !== undefined) updateData.user_user_id = user_user_id

    updateData.bulan_last_update = new Date()

    const bulan = await prisma.bulan.update({
      where: { bulan_id: parseInt(id) },
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
    await prisma.bulan.delete({
      where: { bulan_id: parseInt(id) },
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
