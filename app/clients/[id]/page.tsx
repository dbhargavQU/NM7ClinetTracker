import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { isMonthPaid, getPaymentStatusWithExpiry } from '@/lib/client-helpers'
import { formatCurrency, formatDateIST } from '@/lib/format'
import { Layout } from '@/components/layout'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Plus } from 'lucide-react'
import { WorkoutScheduleSection } from '@/components/workout-schedule-section'
import { PaymentsSection } from '@/components/payments-section'
import { ProgressSection } from '@/components/progress-section'
import { DeleteClientButton } from '@/components/delete-client-button'

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth()

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      workoutSchedules: {
        orderBy: {
          dayOfWeek: 'asc',
        },
      },
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
    notFound()
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const isCurrentMonthPaid = await isMonthPaid(client.id, currentYear, currentMonth, user.id)
  const paymentStatusInfo = await getPaymentStatusWithExpiry(client.id, user.id)

  const latestProgress = client.progressEntries[0]
  const weightDifference = client.startingWeightKg && latestProgress
    ? latestProgress.weightKg - client.startingWeightKg
    : null

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground mt-1">
              Client since {formatDateIST(client.startDate)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/clients/${client.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </Button>
            </Link>
            <DeleteClientButton clientId={client.id} clientName={client.name} />
          </div>
        </div>

        {/* Client Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Client Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Fee</p>
                <p className="text-2xl font-bold">{formatCurrency(Number(client.monthlyFee))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Starting Weight</p>
                <p className="text-2xl font-bold">
                  {client.startingWeightKg ? `${client.startingWeightKg} kg` : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    client.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {client.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status (Current Billing Cycle)</p>
                <div className="mt-2 space-y-2">
                  {paymentStatusInfo.status === 'Paid' ? (
                    <>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✅ Paid
                      </span>
                      {paymentStatusInfo.billingCycleStart && paymentStatusInfo.billingCycleEnd && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cycle: {formatDateIST(paymentStatusInfo.billingCycleStart)} - {formatDateIST(paymentStatusInfo.billingCycleEnd)}
                        </p>
                      )}
                      {paymentStatusInfo.expiresAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {formatDateIST(paymentStatusInfo.expiresAt)}
                          {paymentStatusInfo.daysRemaining !== undefined && (
                            <span className={paymentStatusInfo.daysRemaining <= 7 ? ' text-orange-600 dark:text-orange-400' : ''}>
                              {' '}({paymentStatusInfo.daysRemaining} {paymentStatusInfo.daysRemaining === 1 ? 'day' : 'days'} remaining)
                            </span>
                          )}
                        </p>
                      )}
                    </>
                  ) : paymentStatusInfo.status === 'Partially paid' ? (
                    <>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        ⚠️ Partially Paid
                      </span>
                      {paymentStatusInfo.amountPaid !== undefined && paymentStatusInfo.remainingBalance !== undefined && (
                        <>
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid: {formatCurrency(paymentStatusInfo.amountPaid)} / {formatCurrency(Number(client.monthlyFee))}
                          </p>
                          <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-1">
                            Remaining Balance: {formatCurrency(paymentStatusInfo.remainingBalance)}
                          </p>
                        </>
                      )}
                      {paymentStatusInfo.billingCycleStart && paymentStatusInfo.billingCycleEnd && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cycle: {formatDateIST(paymentStatusInfo.billingCycleStart)} - {formatDateIST(paymentStatusInfo.billingCycleEnd)}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        ❌ Not paid
                      </span>
                      {paymentStatusInfo.billingCycleStart && paymentStatusInfo.billingCycleEnd && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cycle: {formatDateIST(paymentStatusInfo.billingCycleStart)} - {formatDateIST(paymentStatusInfo.billingCycleEnd)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount Due: {formatCurrency(Number(client.monthlyFee))}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            {client.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout Schedule */}
        <WorkoutScheduleSection clientId={client.id} schedules={client.workoutSchedules} />

        {/* Payments */}
        <PaymentsSection
          clientId={client.id}
          clientName={client.name}
          monthlyFee={Number(client.monthlyFee)}
          payments={client.payments.map(payment => ({
            ...payment,
            amount: Number(payment.amount),
          }))}
        />

        {/* Progress Tracker */}
        <ProgressSection
          clientId={client.id}
          startingWeight={client.startingWeightKg}
          progressEntries={client.progressEntries}
          weightDifference={weightDifference}
        />
      </div>
    </Layout>
  )
}

