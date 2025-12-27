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

export async function requireAuth(request: NextRequest): Promise<{
  success: boolean
  user?: {
    userId: number
    userEmail: string | null
    userFullName: string | null
    userRoleRoleId: number | null
  }
}> {
  const token = getAuthToken(request)
  
  if (!token) {
    return { success: false }
  }

  const user = verifyToken(token)
  if (!user) {
    return { success: false }
  }

  return { success: true, user }
}

export function requireRole(
  allowedRoles: number[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const authResult = await requireAuth(req)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!authResult.user.userRoleRoleId || !allowedRoles.includes(authResult.user.userRoleRoleId)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = authResult.user

    return handler(authenticatedReq)
  }
}
