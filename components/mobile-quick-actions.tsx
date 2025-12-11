'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, DollarSign, UserPlus, Calendar } from 'lucide-react'

export function MobileQuickActions() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!session) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Floating Action Button */}
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-2 flex flex-col items-end">
            <Button
              size="sm"
              onClick={() => {
                router.push('/clients/new')
                setIsOpen(false)
              }}
              className="shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
            <Button
              size="sm"
              onClick={() => {
                router.push('/bank')
                setIsOpen(false)
              }}
              className="shadow-lg"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              View Bank
            </Button>
            <Button
              size="sm"
              onClick={() => {
                router.push('/availability')
                setIsOpen(false)
              }}
              className="shadow-lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        )}
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        </Button>
      </div>
    </div>
  )
}

