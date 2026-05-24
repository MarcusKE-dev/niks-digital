'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/lib/utils'

export function FloatingCartButton() {
  const totalItems = useCartStore((state) => state.totalItems())

  return (
    <Link
      href="/cart"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex items-center justify-center',
        'w-14 h-14 rounded-full bg-primary text-white',
        'shadow-lg hover:bg-primary-600 transition-all duration-200',
        'hover:scale-105 active:scale-95'
      )}
      aria-label="Go to shopping cart"
    >
      <ShoppingCart size={24} />
      {totalItems > 0 && (
        <span className={cn(
          'absolute -top-1 -right-1',
          'min-w-[20px] h-5 px-1',
          'bg-danger text-white text-xs font-bold',
          'rounded-full flex items-center justify-center'
        )}>
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}