import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { clientId, dayOfWeek, startTime, endTime, location } = body

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

    const schedule = await prisma.workoutSchedule.create({
      data: {
        clientId,
        dayOfWeek,
        startTime,
        endTime,
        location: location || null,
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

