import { Suspense } from 'react'
import Dashboard from '@/pages/Dashboard'
import AuthGuard from '@/components/AuthGuard'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    </Suspense>
  )
}