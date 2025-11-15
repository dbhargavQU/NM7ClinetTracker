import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateIST } from '@/lib/format'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react'

interface MonthlyEarnings {
  month: number
  year: number
  total: number
  paymentCount: number
}

export default async function BankPage() {
  const user = await requireAuth()

  // Get all payments for this user's clients
  const payments = await prisma.payment.findMany({
    where: {
      client: {
        userId: user.id,
      },
    },
    include: {
      client: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { paidOn: 'desc' },
    ],
  })

  // Calculate total earnings (all time)
  const totalEarnings = payments.reduce((sum, payment) => {
    return sum + Number(payment.amount)
  }, 0)

  // Get current month/year
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Calculate current month earnings
  const currentMonthEarnings = payments
    .filter((p) => p.year === currentYear && p.month === currentMonth)
    .reduce((sum, payment) => sum + Number(payment.amount), 0)

  // Calculate monthly breakdown
  const monthlyBreakdown = new Map<string, MonthlyEarnings>()
  
  payments.forEach((payment) => {
    const key = `${payment.year}-${payment.month}`
    const existing = monthlyBreakdown.get(key)
    
    if (existing) {
      existing.total += Number(payment.amount)
      existing.paymentCount += 1
    } else {
      monthlyBreakdown.set(key, {
        month: payment.month,
        year: payment.year,
        total: Number(payment.amount),
        paymentCount: 1,
      })
    }
  })

  const monthlyData = Array.from(monthlyBreakdown.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  // Get clients with pending payments (not fully paid in current billing cycle)
  const clients = await prisma.client.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      payments: true,
    },
  })

  // Calculate pending amounts (simplified - clients who haven't paid this month)
  // This is a simplified calculation - you might want to use the billing cycle logic
  const pendingClients = clients.filter((client) => {
    const monthlyFee = Number(client.monthlyFee)
    const currentMonthPayments = client.payments.filter(
      (p) => p.year === currentYear && p.month === currentMonth
    )
    const paidThisMonth = currentMonthPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )
    return paidThisMonth < monthlyFee
  })

  const totalPending = pendingClients.reduce((sum, client) => {
    const monthlyFee = Number(client.monthlyFee)
    const currentMonthPayments = client.payments.filter(
      (p) => p.year === currentYear && p.month === currentMonth
    )
    const paidThisMonth = currentMonthPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )
    return sum + (monthlyFee - paidThisMonth)
  }, 0)

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bank & Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your total earnings and payment history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(currentMonthEarnings)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {monthNames[currentMonth - 1]} {currentYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Payment records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalPending)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingClients.length} client{pendingClients.length !== 1 ? 's' : ''} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payments recorded yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 py-3">Month & Year</th>
                      <th className="text-left p-2 py-3">Total Earnings</th>
                      <th className="text-left p-2 py-3">Number of Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((month, index) => (
                      <tr
                        key={`${month.year}-${month.month}`}
                        className={`border-b hover:bg-muted/50 ${
                          month.year === currentYear && month.month === currentMonth
                            ? 'bg-blue-50 dark:bg-blue-950'
                            : ''
                        }`}
                      >
                        <td className="p-2 py-3 font-medium">
                          {monthNames[month.month - 1]} {month.year}
                          {month.year === currentYear &&
                            month.month === currentMonth && (
                              <span className="ml-2 text-xs text-blue-600">
                                (Current)
                              </span>
                            )}
                        </td>
                        <td className="p-2 py-3 font-bold">
                          {formatCurrency(month.total)}
                        </td>
                        <td className="p-2 py-3 text-muted-foreground">
                          {month.paymentCount} payment
                          {month.paymentCount !== 1 ? 's' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payments recorded yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 py-3">Date</th>
                      <th className="text-left p-2 py-3">Client</th>
                      <th className="text-left p-2 py-3">Amount</th>
                      <th className="text-left p-2 py-3">Billing Cycle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 20).map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-2 py-3">
                          {formatDateIST(payment.paidOn)}
                        </td>
                        <td className="p-2 py-3 font-medium">
                          {payment.client.name}
                        </td>
                        <td className="p-2 py-3 font-bold">
                          {formatCurrency(Number(payment.amount))}
                        </td>
                        <td className="p-2 py-3 text-sm text-muted-foreground">
                          {monthNames[payment.month - 1]} {payment.year}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length > 20 && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Showing 20 most recent payments of {payments.length} total
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

