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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const search = searchParams.get('search')

    const where: any = {}
    if (search) {
      where.OR = [
        { periodStart: { equals: parseInt(search) } },
        { periodEnd: { equals: parseInt(search) } },
      ]
    }

    const [periods, total] = await Promise.all([
      prisma.period.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          periodId: 'desc',
        },
      }),
      prisma.period.count({ where }),
    ])

    return NextResponse.json({
      periods,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get periods error:', error)
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
    const { periodStart, periodEnd, periodStatus } = body

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If setting as active, deactivate all other periods
    if (periodStatus === true) {
      await prisma.period.updateMany({
        where: { periodStatus: true },
        data: { periodStatus: false },
      })
    }

    const period = await prisma.period.create({
      data: {
        periodStart: parseInt(periodStart),
        periodEnd: parseInt(periodEnd),
        periodStatus: periodStatus || false,
      },
    })

    return NextResponse.json({ period }, { status: 201 })
  } catch (error) {
    console.error('Create period error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
