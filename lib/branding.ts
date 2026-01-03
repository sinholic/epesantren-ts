import { prisma } from './prisma'

export interface Branding {
  appName: string
  schoolName: string
  logoUrl: string | null
  primaryColor: string | null
}

export const DEFAULT_BRANDING: Branding = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'ePesantren',
  schoolName: 'Sekolah',
  logoUrl: null,
  primaryColor: null,
}

/**
 * Validates and sanitizes a hex color string to prevent CSS injection.
 * Only allows valid hex colors (with or without #, 3 or 6 digits).
 * 
 * @param color - The color string to validate
 * @returns The sanitized hex color (with # prefix) or null if invalid
 */
export function validateHexColor(color: string | null | undefined): string | null {
  if (!color || typeof color !== 'string') {
    return null
  }

  // Remove whitespace
  const trimmed = color.trim()

  // Check if it's a valid hex color pattern
  // Matches: #RGB, #RRGGBB, RGB, or RRGGBB (case insensitive)
  const hexPattern = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

  if (!hexPattern.test(trimmed)) {
    return null
  }

  // Normalize to 6-digit hex with # prefix
  let hex = trimmed.replace('#', '')
  
  // Expand 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }

  return `#${hex.toLowerCase()}`
}

/**
 * Generates a hover color by adding opacity (dd = ~87% opacity).
 * Converts hex color to rgba format for proper opacity support.
 * 
 * @param hexColor - Valid hex color (with # prefix)
 * @returns rgba color string with opacity, or null if invalid
 */
export function generateHoverColor(hexColor: string | null): string | null {
  if (!hexColor) {
    return null
  }

  const validated = validateHexColor(hexColor)
  if (!validated) {
    return null
  }

  // Convert hex to RGB
  const hex = validated.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Return rgba with ~87% opacity (dd in hex = 221/255 ≈ 0.867)
  return `rgba(${r}, ${g}, ${b}, 0.87)`
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
        primaryColor: validateHexColor(school.primary_color),
      }
    }

    // Try subdomain match (e.g., "school.example.com" -> match "example.com")
    const parts = cleanHostname.split('.')
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join('.') // Get last 2 parts
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
          primaryColor: validateHexColor(schoolBySubdomain.primary_color),
        }
      }
    }
  } catch (error) {
    console.error('Error resolving branding:', error)
    // Fall through to default branding
  }

  return DEFAULT_BRANDING
}
