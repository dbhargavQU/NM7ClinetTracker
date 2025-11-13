import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        workoutSchedules: true,
        payments: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' },
          ],
        },
        progressEntries: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Verify client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { name, startDate, monthlyFee, startingWeightKg, isActive, notes } = body

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        startDate: new Date(startDate),
        monthlyFee: monthlyFee,
        startingWeightKg: startingWeightKg || null,
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null,
      },
    })

    return NextResponse.json({ id: client.id })
  } catch (error) {
    console.error('Error updating client:', error)
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

    // Verify client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await prisma.client.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

