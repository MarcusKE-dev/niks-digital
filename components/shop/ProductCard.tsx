'use client'

import { useState }        from 'react'
import Link                from 'next/link'
import Image               from 'next/image'
import { ShoppingCart, Heart } from 'lucide-react'
import { cn, formatKES, calculateSavings, productImageSrc } from '@/lib/utils'
import { useCartStore, useIsInCart }  from '@/store/cartStore'
import { useToast }                   from '@/components/ui/Toaster'
import { ProductBadge }               from '@/components/ui/Badge'
import { StarRating }                 from '@/components/shop/StarRating'
import type { ProductSummary }        from '@/types'

interface ProductCardProps {
  product:   ProductSummary
  className?: string
  priority?:  boolean   // set true for above-the-fold cards
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [qty, setQty]           = useState(1)
  const [wishlisted, setWish]   = useState(false)
  const addItem                 = useCartStore(s => s.addItem)
  const inCart                  = useIsInCart(product.id)
  const toast                   = useToast()

  const isOutOfStock = product.stock_qty === 0
  const savings      = calculateSavings(product.price, product.old_price)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (isOutOfStock) return
    addItem(product, qty)
    toast.success(`${product.name.split(' ').slice(0, 3).join(' ')} added to cart!`)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    setWish(w => !w)
    toast.info(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn('product-card-base block group focus-ring', className)}
      aria-label={`View ${product.name}`}
    >
      {/* ── IMAGE AREA ── */}
      <div className="relative bg-surface overflow-hidden" style={{ height: 180 }}>
        <Image
          src={productImageSrc(product.thumbnail)}
          alt={`${product.name} — available at Niks Digital Connections`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-4 transition-transform duration-slow group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />

        {/* Badge */}
        <ProductBadge badge={product.badge} />

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={cn(
            'absolute top-2 right-2 z-above',
            'w-7 h-7 rounded-full flex items-center justify-center',
            'bg-white shadow-card transition-colors duration-fast',
            wishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
          )}
        >
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-danger uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-danger/20">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-2.5">
        {/* Brand */}
        {product.brand && (
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted mb-1">
            {product.brand}
          </p>
        )}

        {/* Product name */}
        <h3 className="text-sm font-medium text-dark line-clamp-2 leading-snug mb-1.5 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Stars */}
        <StarRating
          rating={product.rating}
          reviewCount={product.review_count}
          className="mb-2"
        />

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-md font-bold text-dark">
            {formatKES(product.price)}
          </span>
          {product.old_price && (
            <span className="text-xs text-muted line-through">
              {formatKES(product.old_price)}
            </span>
          )}
        </div>

        {savings && (
          <p className="text-xs text-success font-medium mb-2">
            Save {formatKES(savings.amount)} ({savings.percent}% off)
          </p>
        )}

        {/* Qty + Add to cart */}
        <div className="flex items-center gap-2 mt-auto">
          {/* Qty selector */}
          <select
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            onClick={e => e.preventDefault()}
            disabled={isOutOfStock}
            aria-label="Quantity"
            className={cn(
              'h-9 w-16 text-sm border border-border rounded-md px-2',
              'focus:outline-none focus:border-primary bg-white',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {Array.from({ length: Math.min(product.stock_qty, 10) }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
            {isOutOfStock && <option value={0}>0</option>}
          </select>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              'flex-1 h-9 flex items-center justify-center gap-1.5',
              'text-xs font-semibold rounded-full',
              'border transition-all duration-normal',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              inCart
                ? 'bg-primary border-primary text-white'
                : 'bg-white border-primary text-primary hover:bg-primary hover:text-white'
            )}
          >
            <ShoppingCart size={13} aria-hidden />
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
