'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ProgressEntry {
  id: string
  date: Date
  weightKg: number
  notes: string | null
}

export function ProgressForm({
  clientId,
  onSuccess,
  onCancel,
}: {
  clientId: string
  onSuccess: (entry: ProgressEntry) => void
  onCancel: () => void
}) {
  const now = new Date()
  const [date, setDate] = useState(now.toISOString().split('T')[0])
  const [weightKg, setWeightKg] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          date: new Date(date).toISOString(),
          weightKg: parseFloat(weightKg),
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to save entry')
        return
      }

      const data = await response.json()
      onSuccess(data)
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date (DD/MM/YYYY)</Label>
        <DateInput
          id="date"
          value={date}
          onChange={(value) => setDate(value)}
          required
          disabled={loading}
          placeholder="DD/MM/YYYY"
        />
        <p className="text-xs text-muted-foreground">
          Format: DD/MM/YYYY (e.g., 13/11/2025)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weightKg">Weight (kg) *</Label>
        <Input
          id="weightKg"
          type="number"
          step="0.1"
          min="0"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Entry'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

