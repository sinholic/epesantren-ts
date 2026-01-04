import type { Metadata } from 'next'
import { Inter, Lexend } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import { BrandingProvider } from '@/components/providers/BrandingProvider'
import { resolveBranding, generateHoverColor } from '@/lib/branding'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' })

// Metadata is static, but we'll generate it dynamically in generateMetadata if needed
export const metadata: Metadata = {
  title: 'Sistem Informasi Manajemen Pesantren',
  description: 'Sistem untuk membantu administrasi sekolah atau pesantren',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Resolve branding server-side based on hostname
  const headersList = await headers()
  const hostname = headersList.get('host') || 'localhost'
  const branding = await resolveBranding(hostname)

  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {branding.primaryColor && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${branding.primaryColor};
                --primary-hover: ${generateHoverColor(branding.primaryColor) || branding.primaryColor};
              }
            `
          }} />
        )}
      </head>
      <body className={`${inter.variable} ${lexend.variable}`}>
        <BrandingProvider branding={branding}>
          {children}
        </BrandingProvider>
      </body>
    </html>
  )
}
