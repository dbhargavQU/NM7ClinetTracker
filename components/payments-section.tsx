'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { PaymentForm } from './payment-form'
import { formatCurrency, formatDateIST } from '@/lib/format'

interface Payment {
  id: string
  month: number
  year: number
  amount: number
  paidOn: Date
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function PaymentsSection({
  clientId,
  clientName,
  monthlyFee,
  payments: initialPayments,
}: {
  clientId: string
  clientName?: string
  monthlyFee: number
  payments: Payment[]
}) {
  const [payments, setPayments] = useState(initialPayments)
  const [showForm, setShowForm] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return
    }

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPayments(payments.filter((p) => p.id !== id))
        window.location.reload() // Refresh to update payment status
      } else {
        alert('Failed to delete payment')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleFormSuccess = (newPayment: Payment) => {
    setPayments([newPayment, ...payments])
    setShowForm(false)
    window.location.reload() // Refresh to update payment status
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payments</CardTitle>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <PaymentForm
            clientId={clientId}
            monthlyFee={monthlyFee}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No payments recorded</p>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border border-border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-muted-foreground">
                            {monthNames[payment.month - 1]} {payment.year}
                          </p>
                          <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid on {formatDateIST(payment.paidOn)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        {clientName && <th className="text-left p-2 py-3">Client</th>}
                        <th className="text-left p-2 py-3">Month & Year</th>
                        <th className="text-left p-2 py-3">Amount</th>
                        <th className="text-left p-2 py-3">Paid On</th>
                        <th className="text-left p-2 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                          {clientName && (
                            <td className="p-2 py-3 font-medium">
                              {clientName}
                            </td>
                          )}
                          <td className="p-2 py-3">
                            {monthNames[payment.month - 1]} {payment.year}
                          </td>
                          <td className="p-2 py-3">{formatCurrency(payment.amount)}</td>
                          <td className="p-2 py-3">
                            {formatDateIST(payment.paidOn)}
                          </td>
                          <td className="p-2 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(payment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

