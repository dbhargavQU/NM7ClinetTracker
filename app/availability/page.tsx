import { requireAuth } from '@/lib/auth-helpers'
import { getBookedSlots, calculateFreeSlots, type TimeSlot } from '@/lib/availability'
import { formatTimeIST } from '@/lib/format'
import { Layout } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Generate time slots from 6 AM to 10 PM in 30-minute intervals
function generateTimeSlots() {
  const slots: string[] = []
  for (let hour = 6; hour < 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
}

// Convert time string to minutes from midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Get all bookings for a day, sorted by start time
function getBookingsForDay(dayOfWeek: number, bookedSlots: TimeSlot[]): TimeSlot[] {
  return bookedSlots
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

// Check if a time slot is part of a booking
function getBookingForSlot(
  timeSlot: string,
  dayOfWeek: number,
  bookedSlots: TimeSlot[]
): TimeSlot | null {
  const slotMinutes = timeToMinutes(timeSlot)
  const nextSlotMinutes = slotMinutes + 30

  for (const booking of bookedSlots) {
    if (booking.dayOfWeek !== dayOfWeek) continue

    const bookingStart = timeToMinutes(booking.startTime)
    const bookingEnd = timeToMinutes(booking.endTime)

    if (slotMinutes >= bookingStart && slotMinutes < bookingEnd) {
      return booking
    }
  }
  return null
}

export default async function AvailabilityPage() {
  const user = await requireAuth()

  const bookedSlots = await getBookedSlots(user.id)
  const freeSlots = calculateFreeSlots(bookedSlots)
  const timeSlots = generateTimeSlots()

  // Group bookings by day
  const bookingsByDay: Record<number, TimeSlot[]> = {}
  bookedSlots.forEach((slot) => {
    if (!bookingsByDay[slot.dayOfWeek]) {
      bookingsByDay[slot.dayOfWeek] = []
    }
    bookingsByDay[slot.dayOfWeek].push(slot)
  })

  // Color palette for different bookings (like Google Calendar)
  const bookingColors = [
    'bg-blue-100 border-l-4 border-blue-500 text-blue-900 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-100',
    'bg-green-100 border-l-4 border-green-500 text-green-900 dark:bg-green-900/40 dark:border-green-400 dark:text-green-100',
    'bg-purple-100 border-l-4 border-purple-500 text-purple-900 dark:bg-purple-900/40 dark:border-purple-400 dark:text-purple-100',
    'bg-orange-100 border-l-4 border-orange-500 text-orange-900 dark:bg-orange-900/40 dark:border-orange-400 dark:text-orange-100',
    'bg-pink-100 border-l-4 border-pink-500 text-pink-900 dark:bg-pink-900/40 dark:border-pink-400 dark:text-pink-100',
    'bg-indigo-100 border-l-4 border-indigo-500 text-indigo-900 dark:bg-indigo-900/40 dark:border-indigo-400 dark:text-indigo-100',
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Availability Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your weekly schedule with booked sessions and available time slots
          </p>
        </div>

        {/* Google Calendar Style Grid */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header Row - Days */}
                <div className="grid grid-cols-8 border-b-2 border-border bg-muted/40">
                  <div className="p-4 font-medium text-sm text-muted-foreground border-r border-border">
                    Time
                  </div>
                  {dayNames.map((day, index) => {
                    const today = new Date()
                    const isToday = today.getDay() === index
                    const dayDate = new Date(today)
                    dayDate.setDate(today.getDate() + (index - today.getDay()))
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 text-center border-r border-border last:border-r-0 ${
                          isToday
                            ? 'bg-blue-50 dark:bg-blue-950/30 border-b-2 border-blue-500'
                            : 'bg-background'
                        }`}
                      >
                        <div
                          className={`text-xs font-medium mb-1 ${
                            isToday
                              ? 'text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {dayNamesShort[index]}
                        </div>
                        <div
                          className={`text-xl font-semibold ${
                            isToday
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-foreground'
                          }`}
                        >
                          {dayDate.getDate()}
                        </div>
                        {bookingsByDay[index] && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {bookingsByDay[index].length} session
                            {bookingsByDay[index].length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Calendar Body */}
                <div className="grid grid-cols-8">
                  {/* Time Column */}
                  <div className="border-r border-border bg-muted/20">
                    {timeSlots.map((timeSlot) => {
                      const [hours, minutes] = timeSlot.split(':').map(Number)
                      const isHourMark = minutes === 0
                      const displayTime = formatTimeIST(timeSlot)
                      return (
                        <div
                          key={timeSlot}
                          className={`p-2 text-xs border-b border-border/50 ${
                            isHourMark
                              ? 'font-semibold text-foreground border-b-2'
                              : 'text-muted-foreground min-h-[30px]'
                          }`}
                        >
                          {isHourMark && displayTime}
                        </div>
                      )
                    })}
                  </div>

                  {/* Day Columns */}
                  {dayNames.map((_, dayIndex) => {
                    const dayBookings = getBookingsForDay(dayIndex, bookedSlots)
                    
                    return (
                      <div
                        key={dayIndex}
                        className="border-r border-border last:border-r-0 relative"
                      >
                        {timeSlots.map((timeSlot) => {
                          const [hours, minutes] = timeSlot.split(':').map(Number)
                          const isHourMark = minutes === 0
                          const slotMinutes = timeToMinutes(timeSlot)
                          const booking = getBookingForSlot(timeSlot, dayIndex, bookedSlots)
                          const isBookingStart = booking && timeToMinutes(booking.startTime) === slotMinutes

                          if (isBookingStart && booking) {
                            const bookingDuration = timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime)
                            const rowSpan = Math.max(1, Math.ceil(bookingDuration / 30))
                            const colorIndex = booking.clientName.charCodeAt(0) % bookingColors.length
                            const colorClass = bookingColors[colorIndex]

                            return (
                              <div
                                key={timeSlot}
                                className={`${colorClass} rounded-sm m-1 p-2 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                                style={{
                                  position: 'absolute',
                                  top: `${((slotMinutes - 360) / 30) * 30}px`,
                                  left: '4px',
                                  right: '4px',
                                  height: `${Math.max(30, bookingDuration / 30 * 30)}px`,
                                  zIndex: 10,
                                }}
                              >
                                <div className="text-xs font-semibold truncate mb-0.5">
                                  {booking.clientName}
                                </div>
                                <div className="text-[10px] opacity-80 truncate">
                                  {formatTimeIST(booking.startTime)} - {formatTimeIST(booking.endTime)}
                                </div>
                                {booking.location && (
                                  <div className="text-[10px] opacity-60 mt-0.5 truncate">
                                    📍 {booking.location}
                                  </div>
                                )}
                              </div>
                            )
                          }

                          // Empty slot
                          return (
                            <div
                              key={timeSlot}
                              className={`border-b border-border/30 min-h-[30px] hover:bg-muted/20 transition-colors ${
                                isHourMark ? 'border-b-2' : ''
                              }`}
                            ></div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Booked Sessions</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {bookedSlots.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">📅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Time Slots</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {freeSlots.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Hours/Week</p>
                  <p className="text-2xl font-bold mt-1">
                    {Math.round(
                      freeSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">⏰</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
