import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { clientId, dayOfWeek, daysOfWeek, startTime, endTime, location } = body

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Support both single day (backward compatibility) and multiple days
    const days = daysOfWeek && Array.isArray(daysOfWeek) 
      ? daysOfWeek 
      : (dayOfWeek !== undefined ? [dayOfWeek] : [])

    if (!days || days.length === 0) {
      return NextResponse.json({ error: 'At least one day must be selected' }, { status: 400 })
    }

    // Create schedules for all selected days
    const schedules = await Promise.all(
      days.map((day: number) =>
        prisma.workoutSchedule.create({
          data: {
            clientId,
            dayOfWeek: day,
            startTime,
            endTime,
            location: location || null,
          },
        })
      )
    )

    // Return array if multiple schedules, single schedule if one
    return NextResponse.json(
      schedules.length === 1 ? schedules[0] : schedules,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

