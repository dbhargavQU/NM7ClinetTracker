import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import DashboardPage from '../page'

export default async function ClientsPage() {
  await requireAuth()
  return <DashboardPage />
}

