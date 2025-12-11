import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getCurrentMonthPaymentStatus, getNextWorkoutScheduleForClient, getPaymentStatusWithExpiry } from '@/lib/client-helpers'
import { formatCurrency } from '@/lib/format'
import { Layout } from '@/components/layout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { ClientTableRow } from '@/components/client-table-row'
import { ClientCard } from '@/components/client-card'

interface ClientWithStatus {
  id: string
  name: string
  startDate: Date
  monthlyFee: number
  isActive: boolean
  paymentStatus: 'Paid' | 'Partially paid' | 'Not paid'
  nextWorkout: string | null
}

export default async function DashboardPage() {
  const user = await requireAuth()

  const clients = await prisma.client.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      name: 'asc',
    },
  })

  const clientsWithStatus: ClientWithStatus[] = await Promise.all(
    clients.map(async (client) => {
      const paymentStatus = await getCurrentMonthPaymentStatus(client.id, user.id)
      const nextWorkout = await getNextWorkoutScheduleForClient(client.id, user.id)
      
      return {
        id: client.id,
        name: client.name,
        startDate: client.startDate,
        monthlyFee: Number(client.monthlyFee),
        isActive: client.isActive,
        paymentStatus,
        nextWorkout: nextWorkout ? `${nextWorkout.day} ${nextWorkout.time}` : null,
      }
    })
  )

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <Link href="/clients/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clientsWithStatus.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No clients yet. Add your first client to get started.</p>
                <Link href="/clients/new" className="mt-4 inline-block">
                  <Button>Add Client</Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {clientsWithStatus.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 py-3">Name</th>
                        <th className="text-left p-2 py-3">Start Date</th>
                        <th className="text-left p-2 py-3">Monthly Fee</th>
                        <th className="text-left p-2 py-3">Payment Status</th>
                        <th className="text-left p-2 py-3">Next Workout</th>
                        <th className="text-left p-2 py-3">Status</th>
                        <th className="text-left p-2 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsWithStatus.map((client) => (
                        <ClientTableRow key={client.id} client={client} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

