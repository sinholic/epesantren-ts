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
      where: { userId: authResult.user.userId },
      select: {
        userId: true,
        userEmail: true,
        userFullName: true,
        userImage: true,
        userRoleRoleId: true,
        role: {
          select: {
            roleId: true,
            roleName: true,
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
        userId: user.userId,
        email: user.userEmail,
        fullName: user.userFullName,
        image: user.userImage,
        roleId: user.userRoleRoleId,
        roleName: user.role?.roleName,
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
