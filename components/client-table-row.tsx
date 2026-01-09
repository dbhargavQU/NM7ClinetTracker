'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { formatCurrency, formatDateIST } from '@/lib/format'
import { ToggleClientStatusButton } from '@/components/toggle-client-status-button'

interface ClientWithStatus {
  id: string
  name: string
  startDate: Date
  monthlyFee: number
  isActive: boolean
  paymentStatus: 'Paid' | 'Partially paid' | 'Not paid'
  nextWorkout: string | null
}

export function ClientTableRow({ client }: { client: ClientWithStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${client.name}"? This will permanently delete all associated data including schedules, payments, and progress entries. This action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete client')
        return
      }

      // Refresh the page to update the list
      router.refresh()
    } catch (error) {
      alert('An error occurred while deleting the client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="p-2 py-3">
        <Link
          href={`/clients/${client.id}`}
          className="text-primary hover:underline font-medium"
        >
          {client.name}
        </Link>
      </td>
      <td className="p-2 py-3">
        {formatDateIST(client.startDate)}
      </td>
      <td className="p-2 py-3">{formatCurrency(client.monthlyFee)}</td>
      <td className="p-2 py-3">
        <span
          className={`px-2 py-1 rounded text-sm ${
            client.paymentStatus === 'Paid'
              ? 'bg-green-100 text-green-800'
              : client.paymentStatus === 'Partially paid'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {client.paymentStatus}
        </span>
      </td>
      <td className="p-2 py-3 text-sm text-muted-foreground">
        {client.nextWorkout || 'No schedule'}
      </td>
      <td className="p-2 py-3">
        <span
          className={`px-2 py-1 rounded text-sm ${
            client.isActive
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {client.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="p-2 py-3">
        <div className="flex items-center gap-2">
          <ToggleClientStatusButton
            clientId={client.id}
            clientName={client.name}
            isActive={client.isActive}
            variant="ghost"
            size="sm"
            showIcon={false}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

