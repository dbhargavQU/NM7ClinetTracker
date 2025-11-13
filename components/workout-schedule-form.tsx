'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WorkoutSchedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
}

export function WorkoutScheduleForm({
  clientId,
  schedule,
  onSuccess,
  onCancel,
}: {
  clientId: string
  schedule?: WorkoutSchedule
  onSuccess: (schedule: WorkoutSchedule) => void
  onCancel: () => void
}) {
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek.toString() || '')
  const [startTime, setStartTime] = useState(schedule?.startTime || '')
  const [endTime, setEndTime] = useState(schedule?.endTime || '')
  const [location, setLocation] = useState(schedule?.location || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = schedule
        ? `/api/workout-schedules/${schedule.id}`
        : '/api/workout-schedules'
      const method = schedule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          dayOfWeek: parseInt(dayOfWeek),
          startTime,
          endTime,
          location: location || null,
        }),
      })

      if (!response.ok) {
        alert('Failed to save schedule')
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
        <Label htmlFor="dayOfWeek">Day of Week</Label>
        <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
          <SelectTrigger>
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Sunday</SelectItem>
            <SelectItem value="1">Monday</SelectItem>
            <SelectItem value="2">Tuesday</SelectItem>
            <SelectItem value="3">Wednesday</SelectItem>
            <SelectItem value="4">Thursday</SelectItem>
            <SelectItem value="5">Friday</SelectItem>
            <SelectItem value="6">Saturday</SelectItem>
          </SelectContent>
        </Select>
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

