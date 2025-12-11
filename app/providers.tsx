'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { PWAInstaller } from '@/components/pwa-installer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PWAInstaller />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}

