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
        { period_start: { equals: parseInt(search) } },
        { period_end: { equals: parseInt(search) } },
      ]
    }

    const [periods, total] = await Promise.all([
      prisma.period.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          period_id: 'desc',
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
    const { period_start, period_end, period_status } = body

    if (!period_start || !period_end) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If setting as active, deactivate all other periods
    if (period_status === true) {
      await prisma.period.updateMany({
        where: { period_status: true },
        data: { period_status: false },
      })
    }

    const period = await prisma.period.create({
      data: {
        period_start: parseInt(period_start),
        period_end: parseInt(period_end),
        period_status: period_status || false,
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
