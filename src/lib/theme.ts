export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'grupoflow-theme'

export const applyThemeMode = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', mode)
}

export const readThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export const persistThemeMode = (mode: ThemeMode) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
}
