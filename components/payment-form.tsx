'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
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
  const getTodayDate = () => new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState(monthlyFee.toString())
  const [paidOn, setPaidOn] = useState(getTodayDate())
  const [loading, setLoading] = useState(false)
  const [formKey, setFormKey] = useState(0) // Key to force remount on reset

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate amount
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        alert('Please enter a valid amount greater than 0')
        setLoading(false)
        return
      }

      // Validate date - DateInput returns ISO format (YYYY-MM-DD)
      if (!paidOn || paidOn.trim() === '') {
        alert('Please enter a valid date')
        setLoading(false)
        return
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          amount: amountNum,
          paidOn: paidOn, // DateInput already returns ISO format (YYYY-MM-DD)
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMessage = data.error || `Failed to save payment (Status: ${response.status})`
        console.error('Payment API error:', {
          status: response.status,
          error: data.error,
          body: { clientId, amount: amountNum, paidOn },
        })
        alert(errorMessage)
        setLoading(false)
        return
      }

      const data = await response.json()
      
      // Reset form before calling onSuccess to ensure clean state
      const today = getTodayDate()
      setAmount(monthlyFee.toString())
      setPaidOn(today)
      setFormKey(prev => prev + 1) // Force form remount to clear any stale state
      
      onSuccess(data)
    } catch (error: any) {
      console.error('Payment submission error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        body: { clientId, amount, paidOn },
      })
      alert(error.message || 'An error occurred while saving the payment. Please check the console for details.')
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
        <Label htmlFor="paidOn">Paid On (DD/MM/YYYY)</Label>
        <DateInput
          key={`paidOn-${formKey}`}
          id="paidOn"
          value={paidOn}
          onChange={(value) => setPaidOn(value)}
          required
          disabled={loading}
          placeholder="DD/MM/YYYY"
        />
        <p className="text-xs text-muted-foreground">
          Format: DD/MM/YYYY (e.g., 13/11/2025). The system will automatically assign this payment to the correct billing cycle based on your client&apos;s start date.
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

