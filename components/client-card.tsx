'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Calendar, DollarSign, CreditCard, User } from 'lucide-react'
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

export function ClientCard({ client }: { client: ClientWithStatus }) {
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

      router.refresh()
    } catch (error) {
      alert('An error occurred while deleting the client')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Partially paid':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/clients/${client.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-primary hover:underline">
              {client.name}
            </h3>
          </Link>
          <div className="flex gap-1">
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
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>Monthly Fee</span>
            </div>
            <span className="font-semibold">{formatCurrency(client.monthlyFee)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span>Start Date</span>
            </div>
            <span>{formatDateIST(client.startDate)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>Payment</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(client.paymentStatus)}`}>
              {client.paymentStatus}
            </span>
          </div>

          {client.nextWorkout && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Next Workout</span>
              </div>
              <span className="text-xs">{client.nextWorkout}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Status</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                client.isActive
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {client.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

