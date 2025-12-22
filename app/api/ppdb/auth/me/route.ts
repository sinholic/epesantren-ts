import { NextRequest, NextResponse } from 'next/server'
import { verifyPPDBToken } from '@/lib/auth-ppdb'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('ppdb_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const participant = verifyPPDBToken(token)
    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get full participant data from database
    const participants = await prisma.$queryRaw<any[]>`
      SELECT * FROM ppdb_participant 
      WHERE id = ${participant.participantId}
      LIMIT 1
    `

    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    const participantData = participants[0]

    return NextResponse.json({
      participant: {
        participantId: participantData.id,
        nisn: participantData.nisn,
        namaPeserta: participantData.nama_peserta,
        noPendaftaran: participantData.no_pendaftaran,
        status: participantData.status,
        ppdbStatus: participantData.ppdb_status,
      },
    })
  } catch (error) {
    console.error('Get PPDB user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
