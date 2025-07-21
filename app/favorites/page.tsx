import { Suspense } from 'react'
import Favorites from '@/pages/Favorites'

export const dynamic = 'force-dynamic'

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Favorites />
    </Suspense>
  )
}