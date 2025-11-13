'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit } from 'lucide-react'
import { WorkoutScheduleForm } from './workout-schedule-form'
import { formatTimeRange } from '@/lib/format'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface WorkoutSchedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
}

export function WorkoutScheduleSection({
  clientId,
  schedules: initialSchedules,
}: {
  clientId: string
  schedules: WorkoutSchedule[]
}) {
  const [schedules, setSchedules] = useState(initialSchedules)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return
    }

    try {
      const response = await fetch(`/api/workout-schedules/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSchedules(schedules.filter((s) => s.id !== id))
      } else {
        alert('Failed to delete schedule')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleFormSuccess = (newSchedule: WorkoutSchedule) => {
    if (editingId) {
      setSchedules(schedules.map((s) => (s.id === editingId ? newSchedule : s)))
      setEditingId(null)
    } else {
      setSchedules([...schedules, newSchedule])
    }
    setShowForm(false)
  }

  const handleEdit = (schedule: WorkoutSchedule) => {
    setEditingId(schedule.id)
    setShowForm(true)
  }

  const editingSchedule = editingId ? schedules.find((s) => s.id === editingId) : null

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Workout Schedule</CardTitle>
          {!showForm && (
            <Button
              size="sm"
              onClick={() => {
                setEditingId(null)
                setShowForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <WorkoutScheduleForm
            clientId={clientId}
            schedule={editingSchedule || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false)
              setEditingId(null)
            }}
          />
        ) : (
          <>
            {schedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No workout schedule set</p>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {dayNames[schedule.dayOfWeek]} – {formatTimeRange(schedule.startTime, schedule.endTime)}
                      </p>
                      {schedule.location && (
                        <p className="text-sm text-gray-600">{schedule.location}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

