// ════════════════════════════════════════════════════════════
// SKELETON — Animated placeholder shown while content loads
// ════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  rounded?:   'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  const roundedMap = { sm: 'rounded-sm', md: 'rounded', lg: 'rounded-lg', full: 'rounded-full' }
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton', roundedMap[rounded], className)}
    />
  )
}

// ── Product card skeleton ─────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden" aria-hidden="true">
      <Skeleton className="w-full h-[220px]" rounded="sm" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-full" rounded="full" />
      </div>
    </div>
  )
}

// ── Product grid skeleton (n cards) ──────────────────────────
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
