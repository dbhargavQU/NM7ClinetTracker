'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Archive, UserCheck } from 'lucide-react'

interface ToggleClientStatusButtonProps {
  clientId: string
  clientName: string
  isActive: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
}

export function ToggleClientStatusButton({
  clientId,
  clientName,
  isActive,
  variant = 'outline',
  size = 'default',
  showIcon = true,
}: ToggleClientStatusButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const action = isActive ? 'move to Past Clients' : 'reactivate'
    if (!confirm(`Are you sure you want to ${action} "${clientName}"?`)) {
      return
    }

    setLoading(true)

    try {
      // First, get the current client data
      const getResponse = await fetch(`/api/clients/${clientId}`)
      if (!getResponse.ok) {
        throw new Error('Failed to fetch client data')
      }

      const client = await getResponse.json()

      // Update the client with toggled isActive status
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: client.name,
          startDate: client.startDate,
          monthlyFee: Number(client.monthlyFee),
          startingWeightKg: client.startingWeightKg,
          isActive: !isActive,
          notes: client.notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || `Failed to ${action} client`)
        return
      }

      router.refresh()
    } catch (error) {
      alert(`An error occurred while trying to ${action} the client`)
    } finally {
      setLoading(false)
    }
  }

  const buttonText = loading 
    ? 'Updating...' 
    : isActive 
      ? (size === 'sm' ? 'Archive' : 'Move to Past Clients')
      : (size === 'sm' ? 'Reactivate' : 'Reactivate Client')

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
      title={isActive ? 'Move to Past Clients' : 'Reactivate Client'}
    >
      {showIcon && (isActive ? <Archive className="h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />)}
      {buttonText}
    </Button>
  )
}
