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
      where: { user_id: authResult.user!.user_id },
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
    const { user_password, ...userWithoutPassword } = user

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
    const { user_full_name, user_description, user_email } = body

    const updateData: any = {}
    if (user_full_name !== undefined) updateData.user_full_name = user_full_name
    if (user_description !== undefined) updateData.user_description = user_description
    if (user_email !== undefined) {
      // Check if email already exists (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: {
          user_email,
          user_is_deleted: false,
          user_id: { not: authResult.user!.user_id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
      updateData.user_email = user_email
    }

    updateData.user_last_update = new Date()

    const user = await prisma.user.update({
      where: { user_id: authResult.user!.user_id },
      data: updateData,
      include: {
        role: true,
      },
    })

    // Remove password from response
    const { user_password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
