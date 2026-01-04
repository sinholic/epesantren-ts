'use client'

import React, { createContext, useContext, ReactNode } from 'react'

export interface Branding {
  appName: string
  schoolName: string
  logoUrl: string | null
  primaryColor: string | null
}

const BrandingContext = createContext<Branding | null>(null)

export function BrandingProvider({
  children,
  branding,
}: {
  children: ReactNode
  branding: Branding
}) {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding(): Branding {
  const context = useContext(BrandingContext)
  if (!context) {
    // Fallback to default branding if context is not available
    return {
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'ePesantren',
      schoolName: 'Sekolah',
      logoUrl: null,
      primaryColor: null,
    }
  }
  return context
}
