import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const majors = await prisma.major.findMany({
      orderBy: {
        majorsName: 'asc',
      },
    })

    return NextResponse.json({ majors })
  } catch (error) {
    console.error('Get majors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { majorsName, majorsShortName } = body

    if (!majorsName || !majorsShortName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const major = await prisma.major.create({
      data: {
        majorsName,
        majorsShortName,
      },
    })

    return NextResponse.json({ major }, { status: 201 })
  } catch (error) {
    console.error('Create major error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
