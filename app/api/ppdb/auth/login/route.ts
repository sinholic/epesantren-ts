import { NextRequest, NextResponse } from 'next/server'
import { authenticatePPDB, generatePPDBToken } from '@/lib/auth-ppdb'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nisn, password } = body

    if (!nisn || !password) {
      return NextResponse.json(
        { error: 'NISN and password are required' },
        { status: 400 }
      )
    }

    const participant = await authenticatePPDB(nisn, password)
    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generatePPDBToken(participant)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('ppdb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      participant: {
        participantId: participant.participantId,
        nisn: participant.nisn,
        namaPeserta: participant.namaPeserta,
      },
      token,
    })
  } catch (error) {
    console.error('PPDB Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
