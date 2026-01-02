import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    user_id: number
    username: string | null
    user_email: string | null
    user_full_name: string | null
    user_role_role_id: number | null
    user_role_type: string | null
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
    user_id: number
    username: string | null
    user_email: string | null
    user_full_name: string | null
    user_role_role_id: number | null
    user_role_type: string | null
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

    if (!authResult.user.user_role_role_id || !allowedRoles.includes(authResult.user.user_role_role_id)) {
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
