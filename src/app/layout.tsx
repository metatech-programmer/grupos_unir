import type { Metadata, Viewport } from 'next'
import { Sora, Manrope } from 'next/font/google'
import './globals.css'
import GlobalNav from '@/components/GlobalNav'
import PWARegistration from '@/components/PWARegistration'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: 'Grupos - Organizador de Equipos de Trabajo',
  description: 'Plataforma inteligente para formar grupos de trabajo óptimos considerando horarios y zonas horarias',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GrupoFlow',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${sora.variable} ${manrope.variable} bg-gray-50`} style={{ fontFamily: 'var(--font-manrope)' }}>
        <div className="ambient-bg" aria-hidden="true">
          <span className="ambient-shape ambient-shape-1" />
          <span className="ambient-shape ambient-shape-2" />
          <span className="ambient-shape ambient-shape-3" />
          <span className="ambient-grid" />
        </div>
        <PWARegistration />
        <GlobalNav />
        <main className="page-enter">{children}</main>
      </body>
    </html>
  )
}
