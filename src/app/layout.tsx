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
          {/* Top Left Splash */}
          <svg className="ambient-svg ambient-svg-1" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="splash1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.04)" />
              </linearGradient>
            </defs>
            <path d="M150,50 Q200,80 220,150 Q210,200 150,220 Q100,210 80,150 Q90,80 150,50 Z" fill="url(#splash1)" />
            <path d="M150,70 Q190,95 205,150 Q195,190 150,205 Q110,195 95,150 Q105,95 150,70 Z" fill="none" stroke="rgba(37,99,235,0.1)" strokeWidth="1.5"/>
          </svg>

          {/* Top Right Blob */}
          <svg className="ambient-svg ambient-svg-2" viewBox="0 0 280 270" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="blob2" x1="20%" y1="30%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="rgba(14, 165, 233, 0.12)" />
                <stop offset="100%" stopColor="rgba(14, 165, 233, 0.02)" />
              </linearGradient>
            </defs>
            <path d="M80,40 Q140,10 180,50 Q200,100 180,160 Q140,200 80,180 Q40,140 80,40 Z" fill="url(#blob2)" />
            <path d="M85,50 Q135,25 170,60 Q185,105 170,155 Q135,190 85,170 Q50,135 85,50 Z" fill="none" stroke="rgba(14,165,233,0.08)" strokeWidth="1"/>
          </svg>

          {/* Bottom Left Circle & Wave */}
          <svg className="ambient-svg ambient-svg-3" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(20, 184, 166, 0.1)" />
                <stop offset="100%" stopColor="rgba(20, 184, 166, 0.02)" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="100" r="50" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1.5"/>
            <circle cx="60" cy="100" r="40" fill="none" stroke="rgba(20,184,166,0.08)" strokeWidth="0.8"/>
            <path d="M0,120 Q80,100 160,120 Q240,140 320,120 L320,200 L0,200 Z" fill="url(#wave1)"/>
          </svg>

          {/* Bottom Right Flowing Blob */}
          <svg className="ambient-svg ambient-svg-4" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="blob4" x1="70%" y1="20%" x2="30%" y2="90%">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.1)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.03)" />
              </linearGradient>
            </defs>
            <path d="M200,40 Q260,70 270,140 Q255,210 200,240 Q130,255 90,200 Q60,140 80,80 Q130,20 200,40 Z" fill="url(#blob4)" />
            <path d="M200,60 Q250,85 258,140 Q245,200 200,225 Q140,240 105,190 Q80,135 95,90 Q135,40 200,60 Z" fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="1"/>
          </svg>

          {/* Right Side Accent Circle */}
          <svg className="ambient-svg ambient-svg-5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="circle1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.08)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.01)" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#circle1)" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="1.5"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="0.8"/>
          </svg>

          {/* Center Subtle Wave */}
          <svg className="ambient-svg ambient-svg-6" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(14, 165, 233, 0.08)" />
                <stop offset="100%" stopColor="rgba(14, 165, 233, 0.01)" />
              </linearGradient>
            </defs>
            <path d="M0,40 Q100,20 200,40 T400,40 L400,120 L0,120 Z" fill="url(#wave2)"/>
            <path d="M0,50 Q100,35 200,50 T400,50" stroke="rgba(14,165,233,0.1)" fill="none" strokeWidth="1"/>
          </svg>
        </div>
        <PWARegistration />
        <GlobalNav />
        <main className="page-enter">{children}</main>
      </body>
    </html>
  )
}
