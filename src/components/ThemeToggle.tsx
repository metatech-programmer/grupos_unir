'use client'

import { useEffect, useState } from 'react'
import { applyThemeMode, persistThemeMode, readThemeMode, ThemeMode } from '@/lib/theme'
import { MoonIcon, SunIcon } from '@/components/icons'

type ThemeToggleProps = {
  className?: string
  compact?: boolean
}

export default function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
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
      className={className || 'btn-ghost text-sm'}
      aria-label={label}
      title={label}
    >
      {compact ? (
        <span className="inline-flex items-center justify-center">
          {mode === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
        </span>
      ) : (
        mode === 'light' ? 'Claro' : 'Oscuro'
      )}
    </button>
  )
}
