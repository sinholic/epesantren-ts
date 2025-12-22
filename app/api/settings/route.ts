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
    const name = searchParams.get('name')

    const where: any = {}
    if (name) {
      where.settingName = name
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: {
        settingId: 'asc',
      },
    })

    // If name is provided, return single setting
    if (name) {
      return NextResponse.json({ setting: settings[0] || null })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
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
    const { settingName, settingValue } = body

    if (!settingName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if setting already exists
    const existing = await prisma.setting.findFirst({
      where: { settingName },
    })

    let setting
    if (existing) {
      // Update existing
      setting = await prisma.setting.update({
        where: { settingId: existing.settingId },
        data: {
          settingValue,
          settingLastUpdate: new Date(),
        },
      })
    } else {
      // Create new
      setting = await prisma.setting.create({
        data: {
          settingName,
          settingValue,
          settingLastUpdate: new Date(),
        },
      })
    }

    return NextResponse.json({ setting }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Create/Update setting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
