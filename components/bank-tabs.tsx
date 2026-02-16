'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface BankTabsProps {
  activeTab: string
}

export function BankTabs({ activeTab }: BankTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'overview') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    router.push(`/bank?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 border-b border-border pb-4">
      <Button
        variant={activeTab === 'overview' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleTabChange('overview')}
        className="text-sm"
      >
        Overview
      </Button>
      <Button
        variant={activeTab === 'estimated' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleTabChange('estimated')}
        className="text-sm"
      >
        Estimated Monthly Earnings
      </Button>
    </div>
  )
}
