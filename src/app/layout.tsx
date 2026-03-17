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
  const motivationalPhrases = [
    'Juntos somos más fuertes',
    'Colaboración sin límites',
    'Sinergia en equipo',
    'Trabajo conjunto, éxito común',
    'Unidos hacia el objetivo',
    'Diversidad que suma',
    'Talento compartido',
    'Creatividad colaborativa',
  ]

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${sora.variable} ${manrope.variable} bg-gray-50`} style={{ fontFamily: 'var(--font-manrope)' }}>
        <div className="ambient-bg" aria-hidden="true">
          <div className="ambient-scroll">
            <div className="ambient-scroll-inner">
              {motivationalPhrases.map((phrase, idx) => (
                <span key={`phrase-${idx}`} className="ambient-scroll-item">
                  {phrase}
                </span>
              ))}
              {motivationalPhrases.map((phrase, idx) => (
                <span key={`phrase-repeat-${idx}`} className="ambient-scroll-item">
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </div>
        <PWARegistration />
        <GlobalNav />
        <main className="page-enter">{children}</main>
      </body>
    </html>
  )
}
