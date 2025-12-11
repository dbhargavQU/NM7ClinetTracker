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

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(payment.getTime())) {
    throw new Error('Invalid date provided')
  }

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
  
  // Validate the calculated month and year
  const month = cycleStart.getMonth() + 1
  const year = cycleStart.getFullYear()
  
  if (month < 1 || month > 12 || year < 1900 || year > 2100) {
    throw new Error(`Invalid billing cycle calculated: month=${month}, year=${year}`)
  }
  
  // Return the month and year of the billing cycle start
  return {
    month,
    year,
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { clientId, amount, paidOn } = body

    // Validate required fields
    if (!clientId || amount === undefined || !paidOn) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, amount, or paidOn' },
        { status: 400 }
      )
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      )
    }

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

    // Parse the paidOn date - handle both ISO string and date object
    let paidOnDate: Date
    if (typeof paidOn === 'string') {
      // If it's an ISO string (YYYY-MM-DD), parse it properly using UTC to avoid timezone issues
      if (paidOn.includes('T')) {
        paidOnDate = new Date(paidOn)
      } else {
        // Parse YYYY-MM-DD format as UTC date to avoid timezone shifts
        const [year, month, day] = paidOn.split('-').map(Number)
        if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
          return NextResponse.json(
            { error: 'Invalid date format. Expected YYYY-MM-DD' },
            { status: 400 }
          )
        }
        // Create date in UTC to avoid timezone issues
        paidOnDate = new Date(Date.UTC(year, month - 1, day))
      }
    } else {
      paidOnDate = new Date(paidOn)
    }

    // Validate the date
    if (isNaN(paidOnDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format for paidOn' },
        { status: 400 }
      )
    }

    // Calculate which billing cycle this payment belongs to
    const { month, year } = getBillingCycleForDate(client.startDate, paidOnDate)

    // Allow multiple payments per billing cycle to support partial payments
    const payment = await prisma.payment.create({
      data: {
        clientId,
        month,
        year,
        amount: amountNum,
        paidOn: paidOnDate,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    
    // Return more specific error messages
    if (error.message?.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

