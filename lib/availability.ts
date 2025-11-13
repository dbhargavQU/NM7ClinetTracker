import { prisma } from './prisma'
import { formatTimeRange } from './format'

export interface TimeSlot {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  clientName: string
  location?: string
}

export interface FreeSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
  duration: number // in minutes
}

/**
 * Get all booked time slots for a trainer
 */
export async function getBookedSlots(userId: string): Promise<TimeSlot[]> {
  const clients = await prisma.client.findMany({
    where: { userId },
    include: {
      workoutSchedules: true,
    },
  })

  const slots: TimeSlot[] = []
  for (const client of clients) {
    for (const schedule of client.workoutSchedules) {
      slots.push({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        clientName: client.name,
        location: schedule.location || undefined,
      })
    }
  }

  return slots
}

/**
 * Calculate free time slots based on booked slots
 * Assumes working hours: 6:00 AM - 10:00 PM (IST)
 */
export function calculateFreeSlots(bookedSlots: TimeSlot[]): FreeSlot[] {
  const workingHours = {
    start: '06:00',
    end: '22:00',
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const freeSlots: FreeSlot[] = []

  // Group booked slots by day
  const bookedByDay: Record<number, TimeSlot[]> = {}
  for (const slot of bookedSlots) {
    if (!bookedByDay[slot.dayOfWeek]) {
      bookedByDay[slot.dayOfWeek] = []
    }
    bookedByDay[slot.dayOfWeek].push(slot)
  }

  // For each day, find free slots
  for (let day = 0; day < 7; day++) {
    const dayBookings = bookedByDay[day] || []
    
    // Sort bookings by start time
    dayBookings.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number)
      const timeB = b.startTime.split(':').map(Number)
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
    })

    let currentTime = workingHours.start

    for (const booking of dayBookings) {
      // If there's a gap before this booking, it's a free slot
      if (currentTime < booking.startTime) {
        const duration = timeDifference(currentTime, booking.startTime)
        if (duration >= 30) { // Only show slots of 30+ minutes
          freeSlots.push({
            dayOfWeek: day,
            startTime: currentTime,
            endTime: booking.startTime,
            duration,
          })
        }
      }
      // Move current time to end of this booking
      currentTime = booking.endTime
    }

    // Check if there's free time after the last booking
    if (currentTime < workingHours.end) {
      const duration = timeDifference(currentTime, workingHours.end)
      if (duration >= 30) {
        freeSlots.push({
          dayOfWeek: day,
          startTime: currentTime,
          endTime: workingHours.end,
          duration,
        })
      }
    }

    // If no bookings for this day, the whole day is free
    if (dayBookings.length === 0) {
      const duration = timeDifference(workingHours.start, workingHours.end)
      freeSlots.push({
        dayOfWeek: day,
        startTime: workingHours.start,
        endTime: workingHours.end,
        duration,
      })
    }
  }

  return freeSlots
}

/**
 * Calculate time difference in minutes
 */
function timeDifference(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  return (endHour * 60 + endMin) - (startHour * 60 + startMin)
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(slot: FreeSlot | TimeSlot): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return `${dayNames[slot.dayOfWeek]} ${formatTimeRange(slot.startTime, slot.endTime)}`
}

