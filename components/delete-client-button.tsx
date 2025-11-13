'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This will permanently delete all associated data including schedules, payments, and progress entries. This action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete client')
        return
      }

      // Redirect to dashboard after successful deletion
      router.push('/')
      router.refresh()
    } catch (error) {
      alert('An error occurred while deleting the client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center space-x-2"
    >
      <Trash2 className="h-4 w-4" />
      <span>{loading ? 'Deleting...' : 'Delete Client'}</span>
    </Button>
  )
}

