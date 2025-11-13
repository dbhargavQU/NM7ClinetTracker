import { requireAuth } from '@/lib/auth-helpers'
import { Layout } from '@/components/layout'
import { ClientForm } from '@/components/client-form'

export default async function NewClientPage() {
  await requireAuth()

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Add New Client</h1>
        <ClientForm />
      </div>
    </Layout>
  )
}

