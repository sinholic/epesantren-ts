import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import bcrypt from 'bcryptjs'

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
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        role: true,
      },
    })

    if (!user || user.user_is_deleted) {
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
      username,
      user_email,
      user_password,
      user_full_name,
      user_description,
      user_role_role_id,
    } = body

    const updateData: any = {}
    if (username !== undefined) {
      // Check if username already exists (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          user_is_deleted: false,
          user_id: { not: parseInt(id) },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        )
      }
      updateData.username = username
    }
    if (user_full_name !== undefined) updateData.user_full_name = user_full_name
    if (user_description !== undefined) updateData.user_description = user_description
    if (user_role_role_id !== undefined) updateData.user_role_role_id = user_role_role_id
    if (user_email !== undefined) {
      // Check if email already exists (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: {
          user_email,
          user_is_deleted: false,
          user_id: { not: parseInt(id) },
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
    if (user_password !== undefined && user_password !== '') {
      updateData.user_password = await bcrypt.hash(user_password, 10)
    }

    updateData.user_last_update = new Date()

    const user = await prisma.user.update({
      where: { user_id: parseInt(id) },
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
    await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: { user_is_deleted: true, user_last_update: new Date() },
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
