import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { user_id: authResult.user.user_id },
      select: {
        user_id: true,
        username: true,
        user_email: true,
        user_full_name: true,
        user_image: true,
        user_role_role_id: true,
        user_role_type: true,
        role: {
          select: {
            role_id: true,
            role_name: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.user_email,
        fullName: user.user_full_name,
        image: user.user_image,
        roleId: user.user_role_role_id,
        roleType: user.user_role_type,
        roleName: user.role?.role_name,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
