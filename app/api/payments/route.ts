import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

/**
 * Calculate which billing cycle a payment date falls into based on client start date
 */
function getBillingCycleForDate(startDate: Date, paymentDate: Date) {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const payment = new Date(paymentDate)
  payment.setHours(0, 0, 0, 0)

  // Calculate months since start
  const monthsDiff = (payment.getFullYear() - start.getFullYear()) * 12 + 
                     (payment.getMonth() - start.getMonth())
  
  // If payment date is before the start day of the month, we're in the previous cycle
  const startDay = start.getDate()
  const paymentDay = payment.getDate()
  const adjustedMonths = paymentDay < startDay ? monthsDiff - 1 : monthsDiff

  // Calculate billing cycle start (start date + adjusted months)
  const cycleStart = new Date(start)
  cycleStart.setMonth(start.getMonth() + adjustedMonths)
  
  // Return the month and year of the billing cycle start
  return {
    month: cycleStart.getMonth() + 1,
    year: cycleStart.getFullYear(),
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { clientId, amount, paidOn } = body

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

    // Calculate which billing cycle this payment belongs to
    const paidOnDate = new Date(paidOn)
    const { month, year } = getBillingCycleForDate(client.startDate, paidOnDate)

    // Allow multiple payments per billing cycle to support partial payments
    const payment = await prisma.payment.create({
      data: {
        clientId,
        month,
        year,
        amount,
        paidOn: paidOnDate,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

