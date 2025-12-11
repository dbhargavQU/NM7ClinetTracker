'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, Users, Home, Calendar, Wallet, Menu, X } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-card border-b border-border">
        <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
          <Home className="h-6 w-6" />
          <span className="text-lg font-bold">NM7 Tracker</span>
        </Link>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-card border-b border-border z-50 shadow-lg">
            <nav className="flex flex-col py-4">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/clients"
                className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Clients</span>
              </Link>
              <Link
                href="/availability"
                className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>Availability</span>
              </Link>
              <Link
                href="/bank"
                className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Wallet className="h-5 w-5" />
                <span>Bank</span>
              </Link>
              <div className="border-t border-border mt-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut({ callbackUrl: '/auth/login' })
                    setIsOpen(false)
                  }}
                  className="w-full justify-start px-4 py-3 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Logout</span>
                </Button>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}

