import { useTheme } from '@/components/ThemeProvider'

export const useToggleTheme = () => {
  const { theme, setTheme } = useTheme()

  return {
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light')
  }
}
