'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface WorkoutSchedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
}

const dayNames = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export function WorkoutScheduleForm({
  clientId,
  schedule,
  onSuccess,
  onCancel,
}: {
  clientId: string
  schedule?: WorkoutSchedule
  onSuccess: (schedule: WorkoutSchedule | WorkoutSchedule[]) => void
  onCancel: () => void
}) {
  // For editing, only allow single day
  const isEditing = !!schedule
  const [selectedDays, setSelectedDays] = useState<number[]>(
    schedule ? [schedule.dayOfWeek] : []
  )
  const [startTime, setStartTime] = useState(schedule?.startTime || '')
  const [endTime, setEndTime] = useState(schedule?.endTime || '')
  const [location, setLocation] = useState(schedule?.location || '')
  const [loading, setLoading] = useState(false)

  const handleDayToggle = (day: number) => {
    if (isEditing) {
      // When editing, only allow one day
      setSelectedDays([day])
    } else {
      // When creating, allow multiple days
      setSelectedDays((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedDays.length === 0) {
      alert('Please select at least one day')
      return
    }

    setLoading(true)

    try {
      if (isEditing) {
        // Update existing schedule
        const response = await fetch(`/api/workout-schedules/${schedule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            dayOfWeek: selectedDays[0],
            startTime,
            endTime,
            location: location || null,
          }),
        })

        if (!response.ok) {
          alert('Failed to update schedule')
          return
        }

        const data = await response.json()
        onSuccess(data)
      } else {
        // Create multiple schedules for selected days
        const response = await fetch('/api/workout-schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            daysOfWeek: selectedDays,
            startTime,
            endTime,
            location: location || null,
          }),
        })

        if (!response.ok) {
          alert('Failed to save schedules')
          return
        }

        const data = await response.json()
        onSuccess(data)
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>
          {isEditing ? 'Day of Week' : 'Days of Week (Select Multiple)'}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border rounded-lg">
          {dayNames.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={selectedDays.includes(day.value)}
                onChange={() => handleDayToggle(day.value)}
                disabled={loading}
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
        {!isEditing && (
          <p className="text-xs text-muted-foreground">
            Select one or more days for this workout schedule
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Gym A"
          disabled={loading}
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : schedule ? 'Update' : 'Add'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

