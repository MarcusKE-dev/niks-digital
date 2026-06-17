'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { cn, formatKES, calculateSavings, productImageSrc } from '@/lib/utils'
import { useCartStore, useIsInCart } from '@/store/cartStore'
import { useToast } from '@/components/ui/Toaster'
import { ProductBadge } from '@/components/ui/Badge'
import type { ProductSummary } from '@/types'
import { useWishlistStore } from '@/store/wishlistStore'

interface ProductCardProps {
  product: ProductSummary
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const inCart = useIsInCart(product.id)
  const toast = useToast()
  const { addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const isWishlisted = useWishlistStore(state => state.isWishlisted(product.id))

  const isOutOfStock = product.stock_qty === 0
  const savings = calculateSavings(product.price, product.old_price)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (isOutOfStock) return
    addItem(product, qty)
    toast.success(`${product.name.split(' ').slice(0, 3).join(' ')} added to cart!`)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlisted) {
      removeFromWishlist(product.id)
      toast.info('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist')
    }
  }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn('product-card-base block group focus-ring', className)}
      aria-label={`View ${product.name}`}
    >
      {/* ── IMAGE AREA (larger, less padding) ── */}
      <div className="relative bg-surface overflow-hidden" style={{ height: 200 }}>
        <Image
          src={productImageSrc(product.thumbnail)}
          alt={`${product.name} — available at Niks Digital Connections`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-2 transition-transform duration-slow group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />
        <ProductBadge badge={product.badge} />
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 z-above w-7 h-7 flex items-center justify-center transition-transform duration-fast hover:scale-110"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isWishlisted ? '#CC0000' : 'none'}
            stroke={isWishlisted ? '#CC0000' : '#9CA3AF'}
            strokeWidth={2}
            className="transition-all duration-fast"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-danger uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-danger/20">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        {product.brand && (
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted mb-1">
            {product.brand}
          </p>
        )}
        <h3 className="text-xs font-medium text-dark line-clamp-2 leading-snug mb-1.5 min-h-[2rem]">
          {product.name}
        </h3>

        {/* Stars removed */}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-sm font-bold text-dark">
            {formatKES(product.price)}
          </span>
          {product.old_price && (
            <span className="text-2xs text-muted line-through">
              {formatKES(product.old_price)}
            </span>
          )}
        </div>

        {/* Centered button */}
        <div className="flex justify-center">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              'flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-bold rounded-full',
              'bg-primary text-white hover:bg-primary-600',
              'transition-all duration-normal disabled:opacity-40 disabled:cursor-not-allowed',
              'w-auto min-w-[100px]'
            )}
          >
            <ShoppingCart size={13} aria-hidden />
            {isOutOfStock ? 'Out of Stock' : inCart ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}