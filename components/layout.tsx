'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, Users, Home, Calendar } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-6 w-6" />
                <span className="text-xl font-bold">NM7 Project Tracker</span>
              </Link>
              <Link
                href="/clients"
                className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Clients</span>
              </Link>
              <Link
                href="/availability"
                className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Calendar className="h-5 w-5" />
                <span>Availability</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

