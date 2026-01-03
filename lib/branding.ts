import { prisma } from './prisma'

export interface Branding {
  appName: string
  schoolName: string
  logoUrl: string | null
  primaryColor: string | null
}

const DEFAULT_BRANDING: Branding = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'ePesantren',
  schoolName: 'Sekolah',
  logoUrl: null,
  primaryColor: null,
}

/**
 * Resolves branding information based on the hostname/domain.
 * Queries the database to find matching school by domain or subdomain.
 * Falls back to default branding if no match is found.
 *
 * @param hostname - The hostname from the request (e.g., "example.com" or "school.example.com")
 * @returns Promise<Branding> - The resolved branding information
 */
export async function resolveBranding(hostname: string): Promise<Branding> {
  try {
    // Remove port if present (e.g., "localhost:3000" -> "localhost")
    const cleanHostname = hostname.split(':')[0]

    // Try to find school by exact domain match
    const school = await prisma.school.findFirst({
      where: {
        domain: cleanHostname,
        deleted_at: null,
      },
    })

    if (school) {
      return {
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'ePesantren',
        schoolName: school.school_name,
        logoUrl: school.logo_url,
        primaryColor: school.primary_color,
      }
    }

    // Try subdomain match (e.g., "school.example.com" -> match "example.com")
    const parts = cleanHostname.split('.')
    if (parts.length >= 3) {
      // Handle common multi-segment TLDs
      const knownTLDs = ['co.uk', 'ac.uk', 'co.id', 'ac.id', 'school.id', 'go.id']
      let parentDomain: string
      
      // Check if ends with known multi-segment TLD
      const lastThree = parts.slice(-3).join('.')
      if (knownTLDs.some(tld => lastThree.endsWith(tld))) {
        parentDomain = lastThree
      } else {
        parentDomain = parts.slice(-2).join('.')
      }
      
      const schoolBySubdomain = await prisma.school.findFirst({
      const schoolBySubdomain = await prisma.school.findFirst({
        where: {
          domain: parentDomain,
          deleted_at: null,
        },
      })

      if (schoolBySubdomain) {
        return {
          appName: process.env.NEXT_PUBLIC_APP_NAME || 'ePesantren',
          schoolName: schoolBySubdomain.school_name,
          logoUrl: schoolBySubdomain.logo_url,
          primaryColor: schoolBySubdomain.primary_color,
        }
      }
    }
  } catch (error) {
    console.error('Error resolving branding:', error)
    // Fall through to default branding
  }

  return DEFAULT_BRANDING
}
