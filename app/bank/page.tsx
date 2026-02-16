import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateIST } from '@/lib/format'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import { BankTabs } from '@/components/bank-tabs'

interface MonthlyEarnings {
  month: number
  year: number
  total: number
  paymentCount: number
}

export default async function BankPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const user = await requireAuth()
  const activeTab = searchParams?.tab || 'overview'

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

  // Calculate estimated monthly earnings (sum of all active clients' monthly fees)
  const estimatedMonthlyEarnings = clients.reduce((sum, client) => {
    return sum + Number(client.monthlyFee)
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

        {/* Tabs */}
        <BankTabs activeTab={activeTab} />

        {/* Estimated Monthly Earnings Tab */}
        {activeTab === 'estimated' && (
          <Card>
            <CardHeader>
              <CardTitle>Estimated Monthly Earnings for {monthNames[currentMonth - 1]} {currentYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Main Estimated Earnings Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Total Estimated Earnings</p>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(estimatedMonthlyEarnings)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {clients.length} active client{clients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <DollarSign className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Estimated from Active Clients</p>
                        <p className="text-sm text-muted-foreground">
                          Sum of all active clients' monthly fees
                        </p>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(estimatedMonthlyEarnings)}</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Already Received</p>
                        <p className="text-sm text-muted-foreground">
                          Payments received this month
                        </p>
                      </div>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(currentMonthEarnings)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div>
                        <p className="font-medium text-orange-900 dark:text-orange-100">Pending</p>
                        <p className="text-sm text-muted-foreground">
                          Expected but not yet received
                        </p>
                      </div>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(estimatedMonthlyEarnings - currentMonthEarnings)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client List */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Active Clients Breakdown</h3>
                  {clients.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No active clients
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 py-3">Client Name</th>
                            <th className="text-left p-2 py-3">Monthly Fee</th>
                            <th className="text-left p-2 py-3">Paid This Month</th>
                            <th className="text-left p-2 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map((client) => {
                            const monthlyFee = Number(client.monthlyFee)
                            const currentMonthPayments = client.payments.filter(
                              (p) => p.year === currentYear && p.month === currentMonth
                            )
                            const paidThisMonth = currentMonthPayments.reduce(
                              (sum, p) => sum + Number(p.amount),
                              0
                            )
                            const isPaid = paidThisMonth >= monthlyFee
                            const isPartiallyPaid = paidThisMonth > 0 && paidThisMonth < monthlyFee

                            return (
                              <tr key={client.id} className="border-b hover:bg-muted/50">
                                <td className="p-2 py-3 font-medium">{client.name}</td>
                                <td className="p-2 py-3">{formatCurrency(monthlyFee)}</td>
                                <td className="p-2 py-3">
                                  {formatCurrency(paidThisMonth)}
                                </td>
                                <td className="p-2 py-3">
                                  {isPaid ? (
                                    <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Paid
                                    </span>
                                  ) : isPartiallyPaid ? (
                                    <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                      Partially Paid
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                      Not Paid
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Tab (Default) */}
        {activeTab === 'overview' && (
          <>
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
        </>
        )}
      </div>
    </Layout>
  )
}

