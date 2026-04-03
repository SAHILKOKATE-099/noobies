import { useEffect, useState } from 'react'

const THEME_KEY = 'typing-theme'
const THEMES = ['mystery', 'angel', 'aurora']

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored && THEMES.includes(stored)) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'mystery' : 'angel'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return {
    theme,
    setTheme,
    themes: THEMES,
  }
}
