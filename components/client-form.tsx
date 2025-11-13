'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

interface Client {
  id: string
  name: string
  startDate: Date
  monthlyFee: number
  isActive: boolean
  startingWeightKg: number | null
  notes: string | null
}

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(client?.name || '')
  const [startDate, setStartDate] = useState(
    client?.startDate ? new Date(client.startDate).toISOString().split('T')[0] : ''
  )
  const [monthlyFee, setMonthlyFee] = useState(client?.monthlyFee?.toString() || '')
  const [startingWeightKg, setStartingWeightKg] = useState(
    client?.startingWeightKg?.toString() || ''
  )
  const [isActive, setIsActive] = useState(client?.isActive ?? true)
  const [notes, setNotes] = useState(client?.notes || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = client ? `/api/clients/${client.id}` : '/api/clients'
      const method = client ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          startDate,
          monthlyFee: parseFloat(monthlyFee),
          startingWeightKg: startingWeightKg ? parseFloat(startingWeightKg) : null,
          isActive,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save client')
        return
      }

      const data = await response.json()
      router.push(`/clients/${data.id}`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyFee">Monthly Fee (₹) *</Label>
            <Input
              id="monthlyFee"
              type="number"
              step="0.01"
              min="0"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingWeightKg">Starting Weight (kg)</Label>
            <Input
              id="startingWeightKg"
              type="number"
              step="0.1"
              min="0"
              value={startingWeightKg}
              onChange={(e) => setStartingWeightKg(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={loading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active client
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

