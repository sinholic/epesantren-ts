import { NextRequest, NextResponse } from 'next/server'
import { authenticatePPDB, generatePPDBToken } from '@/lib/auth-ppdb'
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

    const { nisn, password } = body

    if (!nisn || !password) {
      return NextResponse.json(
        { error: 'NISN and password are required' },
        { status: 400 }
      )
    }

    // Authenticate participant
    let participant
    try {
      participant = await authenticatePPDB(nisn, password)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    let token
    try {
      token = generatePPDBToken(participant)
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
      cookieStore.set('ppdb_token', token, {
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
      participant: {
        participantId: participant.participant_id,
        nisn: participant.nisn,
        namaPeserta: participant.nama_peserta,
      },
      token,
    })
  } catch (error) {
    console.error('PPDB Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
