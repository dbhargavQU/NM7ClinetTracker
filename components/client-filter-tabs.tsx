'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ClientFilterTabsProps {
  activeFilter: string
  activeCount: number
  pastCount: number
}

export function ClientFilterTabs({ activeFilter, activeCount, pastCount }: ClientFilterTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (filter === 'active') {
      params.set('filter', 'active')
    } else if (filter === 'past') {
      params.set('filter', 'past')
    } else {
      params.delete('filter')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={activeFilter === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFilterChange('active')}
        className="text-sm"
      >
        Active Clients ({activeCount})
      </Button>
      <Button
        variant={activeFilter === 'past' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFilterChange('past')}
        className="text-sm"
      >
        Past Clients ({pastCount})
      </Button>
    </div>
  )
}
