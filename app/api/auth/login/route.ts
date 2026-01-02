import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    let user
    try {
      user = await authenticateUser(email, password)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    let token
    try {
      token = generateToken(user)
    } catch (error) {
      console.error('Token generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // Set cookie
    try {
      const cookieStore = await cookies()
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    } catch (error) {
      console.error('Cookie setting error:', error)
      // Continue even if cookie setting fails, token is still returned in response
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.userEmail,
        fullName: user.userFullName,
        roleId: user.userRoleRoleId,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Don't expose stack trace in production
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
