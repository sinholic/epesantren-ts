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
 * Validates and sanitizes a logo URL to prevent XSS and other security issues.
 * Only allows https: URLs or safe relative paths.
 * Disallows dangerous schemes like data:, javascript:, vbscript:, etc.
 * 
 * @param url - The URL string to validate
 * @returns The validated URL or null if invalid
 */
export function validateLogoUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmed = url.trim()
  
  if (trimmed.length === 0) {
    return null
  }

  // Disallow dangerous schemes (case-insensitive)
  const dangerousSchemes = /^(data|javascript|vbscript|file|about|blob):/i
  if (dangerousSchemes.test(trimmed)) {
    return null
  }

  // Check if it's an absolute URL
  try {
    const parsedUrl = new URL(trimmed)
    
    // Only allow https: protocol
    if (parsedUrl.protocol !== 'https:') {
      return null
    }
    
    // Return the validated absolute URL
    return trimmed
  } catch {
    // Not an absolute URL, check if it's a safe relative path
    // Disallow protocol-relative URLs (//example.com)
    if (trimmed.startsWith('//')) {
      return null
    }
    
    // Disallow directory traversal attempts
    if (trimmed.includes('..')) {
      return null
    }
    
    // Allow relative paths starting with / or ./
    // Pattern: /path/to/file or ./path/to/file or just /
    const safeRelativePath = /^(\/|\.\/)/
    
    if (safeRelativePath.test(trimmed)) {
      return trimmed
    }
    
    return null
  }
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
        logoUrl: validateLogoUrl(school.logo_url),
        primaryColor: validateHexColor(school.primary_color),
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
        where: {
          domain: parentDomain,
          deleted_at: null,
        },
      })

      if (schoolBySubdomain) {
        return {
          appName: process.env.NEXT_PUBLIC_APP_NAME || 'ePesantren',
          schoolName: schoolBySubdomain.school_name,
          logoUrl: validateLogoUrl(schoolBySubdomain.logo_url),
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
