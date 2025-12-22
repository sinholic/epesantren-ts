import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number
    userEmail: string | null
    userFullName: string | null
    userRoleRoleId: number | null
  }
}

export function getAuthToken(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try to get token from cookie
  const token = request.cookies.get('auth_token')?.value
  return token || null
}

export function requireAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const token = getAuthToken(req)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = user

    return handler(authenticatedReq)
  }
}

export function requireRole(
  allowedRoles: number[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return requireAuth(async (req) => {
    if (!req.user || !req.user.userRoleRoleId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!allowedRoles.includes(req.user.userRoleRoleId)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    return handler(req)
  })
}
