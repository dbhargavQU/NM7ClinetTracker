import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout'

export default function NotFound() {
  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground mb-8">Page not found</p>
        <Link href="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </Layout>
  )
}

