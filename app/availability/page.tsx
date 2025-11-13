import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getBookedSlots, calculateFreeSlots, formatTimeSlot, type TimeSlot, type FreeSlot } from '@/lib/availability'
import { formatTimeIST } from '@/lib/format'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function AvailabilityPage() {
  const user = await requireAuth()

  const bookedSlots = await getBookedSlots(user.id)
  const freeSlots = calculateFreeSlots(bookedSlots)

  // Group slots by day for better display
  const bookedByDay: Record<number, TimeSlot[]> = {}
  const freeByDay: Record<number, FreeSlot[]> = {}

  for (const slot of bookedSlots) {
    if (!bookedByDay[slot.dayOfWeek]) {
      bookedByDay[slot.dayOfWeek] = []
    }
    bookedByDay[slot.dayOfWeek].push(slot)
  }

  for (const slot of freeSlots) {
    if (!freeByDay[slot.dayOfWeek]) {
      freeByDay[slot.dayOfWeek] = []
    }
    freeByDay[slot.dayOfWeek].push(slot)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Availability Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your booked sessions and available time slots (IST)
          </p>
        </div>

        {/* Weekly Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {dayNames.map((dayName, dayIndex) => {
            const dayBookings = bookedByDay[dayIndex] || []
            const dayFreeSlots = freeByDay[dayIndex] || []
            const hasAnySlots = dayBookings.length > 0 || dayFreeSlots.length > 0

            return (
              <Card key={dayIndex} className="min-h-[400px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{dayName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Booked Slots */}
                  {dayBookings.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-red-600 mb-2 uppercase">
                        Booked ({dayBookings.length})
                      </p>
                      <div className="space-y-2">
                        {dayBookings.map((booking, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-red-50 border border-red-200 rounded text-sm"
                          >
                            <p className="font-medium text-red-900">{booking.clientName}</p>
                            <p className="text-red-700">
                              {formatTimeIST(booking.startTime)} - {formatTimeIST(booking.endTime)}
                            </p>
                            {booking.location && (
                              <p className="text-xs text-red-600 mt-1">📍 {booking.location}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Free Slots */}
                  {dayFreeSlots.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-2 uppercase">
                        Available ({dayFreeSlots.length})
                      </p>
                      <div className="space-y-2">
                        {dayFreeSlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-green-50 border border-green-200 rounded text-sm"
                          >
                            <p className="font-medium text-green-900">
                              {formatTimeIST(slot.startTime)} - {formatTimeIST(slot.endTime)}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              ({Math.floor(slot.duration / 60)}h {slot.duration % 60}m available)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasAnySlots && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <p>No schedule</p>
                      <p className="text-xs mt-1">6:00 AM - 10:00 PM IST available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Booked Slots</p>
                <p className="text-2xl font-bold text-red-600">{bookedSlots.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Free Slots</p>
                <p className="text-2xl font-bold text-green-600">{freeSlots.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Available Hours/Week</p>
                <p className="text-2xl font-bold">
                  {Math.round(freeSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60)} hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

