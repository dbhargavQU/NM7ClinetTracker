import { prisma } from './prisma'
import { formatTimeRange } from './format'

export interface PaymentStatusInfo {
  status: 'Paid' | 'Partially paid' | 'Not paid'
  amountPaid?: number // Total amount paid in current billing cycle
  remainingBalance?: number // Remaining balance to be paid
  expiresAt?: Date // End of the current billing cycle (if paid)
  daysRemaining?: number // Days until expiry
  isExpired?: boolean // Whether payment has expired
  billingCycleStart?: Date // Start of current billing cycle
  billingCycleEnd?: Date // End of current billing cycle
}

/**
 * Calculate the current billing cycle based on client start date
 * Billing cycles are monthly from the start date (e.g., if started on Nov 15, cycles are Nov 15-Dec 14, Dec 15-Jan 14, etc.)
 */
function getCurrentBillingCycle(startDate: Date, now: Date = new Date()) {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const current = new Date(now)
  current.setHours(0, 0, 0, 0)

  // Calculate months since start
  const monthsDiff = (current.getFullYear() - start.getFullYear()) * 12 + 
                     (current.getMonth() - start.getMonth())
  
  // If current date is before the start day of the month, we're in the previous cycle
  const startDay = start.getDate()
  const currentDay = current.getDate()
  const adjustedMonths = currentDay < startDay ? monthsDiff - 1 : monthsDiff

  // Calculate billing cycle start (start date + adjusted months)
  const cycleStart = new Date(start)
  cycleStart.setMonth(start.getMonth() + adjustedMonths)
  
  // Calculate billing cycle end (one month from cycle start, minus 1 day)
  const cycleEnd = new Date(cycleStart)
  cycleEnd.setMonth(cycleStart.getMonth() + 1)
  cycleEnd.setDate(cycleEnd.getDate() - 1)
  cycleEnd.setHours(23, 59, 59, 999)

  return {
    cycleStart,
    cycleEnd,
    cycleMonth: cycleStart.getMonth() + 1,
    cycleYear: cycleStart.getFullYear(),
  }
}

/**
 * Get all payments for the current billing cycle and calculate total amount
 * We check if payment was made during the billing cycle period
 */
async function getPaymentsForBillingCycle(
  clientId: string,
  userId: string,
  cycleStart: Date,
  cycleEnd: Date
) {
  // Get all payments for the client
  const payments = await prisma.payment.findMany({
    where: {
      clientId,
      client: {
        userId,
      },
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ],
  })

  // Filter payments made during the billing cycle period
  // Payment's paidOn date should fall within cycleStart and cycleEnd
  const cyclePayments = payments.filter((payment) => {
    const paidOnDate = new Date(payment.paidOn)
    paidOnDate.setHours(0, 0, 0, 0)
    return paidOnDate >= cycleStart && paidOnDate <= cycleEnd
  })

  // Calculate total amount paid in this cycle
  const totalPaid = cyclePayments.reduce((sum, payment) => {
    return sum + Number(payment.amount)
  }, 0)

  return {
    payments: cyclePayments,
    totalPaid,
  }
}

export async function getCurrentMonthPaymentStatus(
  clientId: string,
  userId: string
): Promise<'Paid' | 'Partially paid' | 'Not paid'> {
  // Get client to access start date and monthly fee
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId,
    },
  })

  if (!client) {
    return 'Not paid'
  }

  const { cycleStart, cycleEnd } = getCurrentBillingCycle(client.startDate)
  const { totalPaid } = await getPaymentsForBillingCycle(clientId, userId, cycleStart, cycleEnd)
  const monthlyFee = Number(client.monthlyFee)

  if (totalPaid >= monthlyFee) {
    return 'Paid'
  } else if (totalPaid > 0) {
    return 'Partially paid'
  } else {
    return 'Not paid'
  }
}

export async function getPaymentStatusWithExpiry(
  clientId: string,
  userId: string
): Promise<PaymentStatusInfo> {
  // Get client to access start date and monthly fee
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId,
    },
  })

  if (!client) {
    return {
      status: 'Not paid',
    }
  }

  const now = new Date()
  const { cycleStart, cycleEnd } = getCurrentBillingCycle(client.startDate, now)
  
  const { totalPaid } = await getPaymentsForBillingCycle(clientId, userId, cycleStart, cycleEnd)
  const monthlyFee = Number(client.monthlyFee)
  const remainingBalance = Math.max(0, monthlyFee - totalPaid)

  // Determine status based on payment amount
  let status: 'Paid' | 'Partially paid' | 'Not paid'
  if (totalPaid >= monthlyFee) {
    status = 'Paid'
  } else if (totalPaid > 0) {
    status = 'Partially paid'
  } else {
    status = 'Not paid'
  }

  // Only show expiry info if fully paid
  if (status === 'Paid') {
    const expiresAt = cycleEnd
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = daysRemaining < 0

    return {
      status,
      amountPaid: totalPaid,
      remainingBalance: 0,
      expiresAt,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      billingCycleStart: cycleStart,
      billingCycleEnd: cycleEnd,
    }
  }

  return {
    status,
    amountPaid: totalPaid,
    remainingBalance,
    billingCycleStart: cycleStart,
    billingCycleEnd: cycleEnd,
  }
}

export async function isMonthPaid(
  clientId: string,
  year: number,
  month: number,
  userId: string
): Promise<boolean> {
  const payment = await prisma.payment.findFirst({
    where: {
      clientId,
      month,
      year,
      client: {
        userId,
      },
    },
  })

  return !!payment
}

export interface NextWorkout {
  day: string
  time: string
  location?: string
}

export async function getNextWorkoutScheduleForClient(
  clientId: string,
  userId: string
): Promise<NextWorkout | null> {
  const schedules = await prisma.workoutSchedule.findMany({
    where: {
      clientId,
      client: {
        userId,
      },
    },
    orderBy: {
      dayOfWeek: 'asc',
    },
  })

  if (schedules.length === 0) {
    return null
  }

  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Find the next workout (same day or later this week, or earliest next week)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (const schedule of schedules) {
    if (schedule.dayOfWeek > currentDay) {
      return {
        day: dayNames[schedule.dayOfWeek],
        time: formatTimeRange(schedule.startTime, schedule.endTime),
        location: schedule.location || undefined,
      }
    }
  }

  // If no schedule found for later this week, return the first one (next week)
  const firstSchedule = schedules[0]
  return {
    day: dayNames[firstSchedule.dayOfWeek],
    time: formatTimeRange(firstSchedule.startTime, firstSchedule.endTime),
    location: firstSchedule.location || undefined,
  }
}

