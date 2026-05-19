'use client'

import { useState }      from 'react'
import { cn }            from '@/lib/utils'
import { ProductCard }   from '@/components/shop/ProductCard'
import type { ProductSummary } from '@/types'

interface Props {
  featured:    ProductSummary[]
  bestSellers: ProductSummary[]
  newArrivals: ProductSummary[]
  onSale:      ProductSummary[]
}

const TABS = [
  { key: 'featured',    label: 'Featured' },
  { key: 'bestSellers', label: 'Best Sellers' },
  { key: 'newArrivals', label: 'New Arrivals' },
  { key: 'onSale',      label: 'On Sale' },
] as const

type TabKey = typeof TABS[number]['key']

export function FeaturedProductTabs({ featured, bestSellers, newArrivals, onSale }: Props) {
  const [active, setActive] = useState<TabKey>('featured')

  const map: Record<TabKey, ProductSummary[]> = { featured, bestSellers, newArrivals, onSale }
  const products = map[active]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-fast',
              'border-b-2 -mb-px',
              active === tab.key
                ? 'text-dark border-primary'
                : 'text-muted border-transparent hover:text-dark'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 5} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted py-12 text-sm">No products in this category yet.</p>
      )}
    </div>
  )
}
