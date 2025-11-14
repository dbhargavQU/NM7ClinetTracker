'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { ProgressForm } from './progress-form'
import { ProgressChart } from './progress-chart'
import { formatDateIST } from '@/lib/format'

interface ProgressEntry {
  id: string
  date: Date
  weightKg: number
  notes: string | null
}

export function ProgressSection({
  clientId,
  startingWeight,
  progressEntries: initialEntries,
  weightDifference,
}: {
  clientId: string
  startingWeight: number | null
  progressEntries: ProgressEntry[]
  weightDifference: number | null
}) {
  const [entries, setEntries] = useState(initialEntries)
  const [showForm, setShowForm] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this progress entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/progress/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEntries(entries.filter((e) => e.id !== id))
        window.location.reload() // Refresh to update chart
      } else {
        alert('Failed to delete entry')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleFormSuccess = (newEntry: ProgressEntry) => {
    setEntries([newEntry, ...entries])
    setShowForm(false)
    window.location.reload() // Refresh to update chart
  }

  // Prepare chart data
  const chartData = [
    ...(startingWeight
      ? [
          {
            date: new Date(2000, 0, 1).toISOString().split('T')[0],
            weight: startingWeight,
            label: 'Starting',
          },
        ]
      : []),
    ...entries
      .slice()
      .reverse()
      .map((e) => ({
        date: new Date(e.date).toISOString().split('T')[0],
        weight: e.weightKg,
        label: formatDateIST(e.date),
      })),
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Progress Tracker</CardTitle>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {startingWeight && (
              <div>
                <p className="text-sm text-gray-600">Starting Weight</p>
                <p className="text-xl font-bold">{startingWeight} kg</p>
              </div>
            )}
            {entries.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Latest Weight</p>
                <p className="text-xl font-bold">{entries[0].weightKg} kg</p>
              </div>
            )}
            {weightDifference !== null && (
              <div>
                <p className="text-sm text-gray-600">Change</p>
                <p
                  className={`text-xl font-bold ${
                    weightDifference < 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {weightDifference > 0 ? '+' : ''}
                  {weightDifference.toFixed(1)} kg
                </p>
              </div>
            )}
          </div>

          {/* Chart */}
          {chartData.length > 0 && <ProgressChart data={chartData} />}

          {/* Form or List */}
          {showForm ? (
            <ProgressForm
              clientId={clientId}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <>
              {entries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No progress entries yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 py-3">Date</th>
                        <th className="text-left p-2 py-3">Weight (kg)</th>
                        <th className="text-left p-2 py-3">Notes</th>
                        <th className="text-left p-2 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 py-3">
                            {formatDateIST(entry.date)}
                          </td>
                          <td className="p-2 py-3 font-medium">{entry.weightKg} kg</td>
                          <td className="p-2 py-3 text-sm text-gray-600">
                            {entry.notes || '-'}
                          </td>
                          <td className="p-2 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

