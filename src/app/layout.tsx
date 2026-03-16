import type { Metadata } from 'next'
import { Sora, Manrope } from 'next/font/google'
import './globals.css'
import GlobalNav from '@/components/GlobalNav'

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${sora.variable} ${manrope.variable} bg-gray-50`} style={{ fontFamily: 'var(--font-manrope)' }}>
        <GlobalNav />
        <main>{children}</main>
      </body>
    </html>
  )
}
