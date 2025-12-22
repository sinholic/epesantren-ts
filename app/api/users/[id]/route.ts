import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import bcrypt from 'bcryptjs'

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

    const user = await prisma.user.findUnique({
      where: { userId: parseInt(params.id) },
      include: {
        role: true,
      },
    })

    if (!user || user.userIsDeleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
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
      userEmail,
      userPassword,
      userFullName,
      userDescription,
      userRoleRoleId,
    } = body

    const updateData: any = {}
    if (userFullName !== undefined) updateData.userFullName = userFullName
    if (userDescription !== undefined) updateData.userDescription = userDescription
    if (userRoleRoleId !== undefined) updateData.userRoleRoleId = userRoleRoleId
    if (userEmail !== undefined) {
      // Check if email already exists (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: {
          userEmail,
          userIsDeleted: false,
          userId: { not: parseInt(params.id) },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
      updateData.userEmail = userEmail
    }
    if (userPassword !== undefined && userPassword !== '') {
      updateData.userPassword = await bcrypt.hash(userPassword, 10)
    }

    updateData.userLastUpdate = new Date()

    const user = await prisma.user.update({
      where: { userId: parseInt(params.id) },
      data: updateData,
      include: {
        role: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
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

    await prisma.user.update({
      where: { userId: parseInt(params.id) },
      data: { userIsDeleted: true, userLastUpdate: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
