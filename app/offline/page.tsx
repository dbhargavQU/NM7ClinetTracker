import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WifiOff, Home } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <WifiOff className="h-24 w-24 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">You&apos;re Offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;re not connected to the internet. Some features may not be available.
          </p>
        </div>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            You can still view cached pages, but you won&apos;t be able to:
          </p>
          <ul className="text-sm text-muted-foreground text-left space-y-1 list-disc list-inside">
            <li>Add or edit clients</li>
            <li>Record payments</li>
            <li>Update schedules</li>
            <li>View real-time data</li>
          </ul>
        </div>
        <Button asChild className="mt-6">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

