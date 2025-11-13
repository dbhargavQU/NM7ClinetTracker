import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Verify schedule belongs to user's client
    const schedule = await prisma.workoutSchedule.findFirst({
      where: {
        id: params.id,
        client: {
          userId: user.id,
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    const { dayOfWeek, startTime, endTime, location } = body

    const updated = await prisma.workoutSchedule.update({
      where: { id: params.id },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        location: location || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Verify schedule belongs to user's client
    const schedule = await prisma.workoutSchedule.findFirst({
      where: {
        id: params.id,
        client: {
          userId: user.id,
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    await prisma.workoutSchedule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

