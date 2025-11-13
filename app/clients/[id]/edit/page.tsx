import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Layout } from '@/components/layout'
import { ClientForm } from '@/components/client-form'
import { notFound } from 'next/navigation'

export default async function EditClientPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth()

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      userId: user.id, // Ensure client belongs to user
    },
  })

  if (!client) {
    notFound()
  }

  // Convert Prisma Decimal to number for ClientForm
  const clientForForm = {
    ...client,
    monthlyFee: Number(client.monthlyFee),
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Client</h1>
        <ClientForm client={clientForForm} />
      </div>
    </Layout>
  )
}

