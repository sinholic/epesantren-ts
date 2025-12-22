import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { userId: authResult.user!.userId },
      include: {
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { userPassword, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userFullName, userDescription, userEmail } = body

    const updateData: any = {}
    if (userFullName !== undefined) updateData.userFullName = userFullName
    if (userDescription !== undefined) updateData.userDescription = userDescription
    if (userEmail !== undefined) {
      // Check if email already exists (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: {
          userEmail,
          userIsDeleted: false,
          userId: { not: authResult.user!.userId },
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

    updateData.userLastUpdate = new Date()

    const user = await prisma.user.update({
      where: { userId: authResult.user!.userId },
      data: updateData,
      include: {
        role: true,
      },
    })

    // Remove password from response
    const { userPassword, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
