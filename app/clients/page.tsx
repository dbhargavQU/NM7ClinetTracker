import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import DashboardPage from '../page'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  await requireAuth()
  return <DashboardPage searchParams={searchParams} />
}

