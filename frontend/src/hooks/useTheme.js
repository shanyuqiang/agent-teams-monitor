import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'agent-teams-monitor-theme'

/**
 * Hook for managing dark/light theme
 * @returns {{ theme: string, toggleTheme: () => void, isDark: boolean }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_KEY)
    if (stored) {
      return stored
    }
    // Default to dark theme for the new Geek style
    return 'dark'
  })

  const [isDark, setIsDark] = useState(theme === 'dark')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem(THEME_KEY, theme)
    setIsDark(theme === 'dark')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, toggleTheme, isDark }
}
