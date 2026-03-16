'use client'

import { useEffect, useState } from 'react'
import { applyThemeMode, persistThemeMode, readThemeMode, ThemeMode } from '@/lib/theme'

type ThemeToggleProps = {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const currentMode = readThemeMode()
    setMode(currentMode)
    applyThemeMode(currentMode)
  }, [])

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light'
    setMode(nextMode)
    persistThemeMode(nextMode)
    applyThemeMode(nextMode)
  }

  const label = mode === 'light' ? 'Modo oscuro' : 'Modo claro'

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={className || 'btn-outline text-sm'}
      aria-label={label}
      title={label}
    >
      {mode === 'light' ? 'Claro' : 'Oscuro'}
    </button>
  )
}
