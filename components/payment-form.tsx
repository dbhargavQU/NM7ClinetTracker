'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormEvent, ChangeEvent } from 'react'

interface Payment {
  id: string
  month: number
  year: number
  amount: number
  paidOn: Date
}

export function PaymentForm({
  clientId,
  monthlyFee,
  onSuccess,
  onCancel,
}: {
  clientId: string
  monthlyFee: number
  onSuccess: (payment: Payment) => void
  onCancel: () => void
}) {
  const now = new Date()
  const [amount, setAmount] = useState(monthlyFee.toString())
  const [paidOn, setPaidOn] = useState(now.toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          amount: parseFloat(amount),
          paidOn: new Date(paidOn).toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to save payment')
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
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paidOn">Paid On</Label>
        <Input
          id="paidOn"
          type="date"
          value={paidOn}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPaidOn(e.target.value)}
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          The system will automatically assign this payment to the correct billing cycle based on your client&apos;s start date.
        </p>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Payment'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

