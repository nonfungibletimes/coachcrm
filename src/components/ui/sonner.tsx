import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/hooks/useTheme'

export function Toaster() {
  const { theme } = useTheme()
  return (
    <Sonner
      theme={theme as 'light' | 'dark'}
      richColors
      position="bottom-right"
    />
  )
}
