import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { name, startDate, monthlyFee, startingWeightKg, isActive, notes } = body

    if (!name || !startDate || monthlyFee === undefined) {
      return NextResponse.json(
        { error: 'Name, start date, and monthly fee are required' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name,
        startDate: new Date(startDate),
        monthlyFee: monthlyFee,
        startingWeightKg: startingWeightKg || null,
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null,
      },
    })

    return NextResponse.json({ id: client.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

