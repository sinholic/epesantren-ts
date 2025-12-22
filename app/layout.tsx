import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ePesantren - Sistem Informasi Manajemen Pesantren',
  description: 'Sistem untuk membantu administrasi sekolah atau pesantren',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
