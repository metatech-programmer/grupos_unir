'use client'

import { useEffect } from 'react'
import { applyThemeMode, readThemeMode } from '@/lib/theme'

export default function PWARegistration() {
  useEffect(() => {
    const savedTheme = readThemeMode()
    applyThemeMode(savedTheme)

    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('No se pudo registrar el service worker:', error)
    })
  }, [])

  return null
}
