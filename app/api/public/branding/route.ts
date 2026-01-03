import { NextRequest, NextResponse } from 'next/server'
import { resolveBranding, DEFAULT_BRANDING } from '@/lib/branding'

/**
 * Server-side only API route to fetch branding information.
 * This route should only be called from server components or server actions.
 * It resolves branding based on the Host header from the request.
 */
export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || 'localhost'
    const branding = await resolveBranding(hostname)

    return NextResponse.json(branding, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json(DEFAULT_BRANDING, { status: 500 })
  }
}
