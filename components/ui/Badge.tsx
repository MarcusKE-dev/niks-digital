// ════════════════════════════════════════════════════════════
// BADGE COMPONENT
// Used for: product labels (New/Sale/Hot), cart count,
// order status, payment status, stock status.
// ════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils'

// ── TYPES ─────────────────────────────────────────────────────

type BadgeVariant =
  | 'new'        // green
  | 'sale'       // red
  | 'hot'        // orange
  | 'in-stock'   // green outline
  | 'low-stock'  // orange outline
  | 'out-stock'  // red outline
  | 'default'    // grey
  | 'primary'    // orange solid
  | 'success'    // green solid
  | 'danger'     // red solid
  | 'warning'    // amber solid
  | 'info'       // blue solid

type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?:  BadgeVariant
  size?:     BadgeSize
  children:  React.ReactNode
  className?: string
  dot?:      boolean   // show a dot before the label
}

// ── STYLE MAP ─────────────────────────────────────────────────

const VARIANTS: Record<BadgeVariant, string> = {
  'new':       'bg-green-100  text-green-700',
  'sale':      'bg-red-100    text-red-700',
  'hot':       'bg-orange-100 text-primary',
  'in-stock':  'bg-green-50   text-green-700 border border-green-200',
  'low-stock': 'bg-orange-50  text-orange-700 border border-orange-200',
  'out-stock': 'bg-red-50     text-red-600   border border-red-200',
  'default':   'bg-gray-100   text-gray-600',
  'primary':   'bg-primary    text-white',
  'success':   'bg-success    text-white',
  'danger':    'bg-danger     text-white',
  'warning':   'bg-warning    text-white',
  'info':      'bg-info       text-white',
}

const SIZES: Record<BadgeSize, string> = {
  sm: 'text-2xs px-1.5 py-0.5 font-semibold',
  md: 'text-xs  px-2   py-1   font-semibold',
}

// ── COMPONENT ─────────────────────────────────────────────────

export function Badge({
  variant   = 'default',
  size      = 'sm',
  children,
  className,
  dot       = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full uppercase tracking-wide leading-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}

// ── PRODUCT BADGE (absolute positioned on card) ───────────────

interface ProductBadgeProps {
  badge: 'new' | 'sale' | 'hot' | null | undefined
  className?: string
}

export function ProductBadge({ badge, className }: ProductBadgeProps) {
  if (!badge) return null

  const LABELS = { new: 'New', sale: 'Sale', hot: 'Hot' } as const

  return (
    <span
      className={cn(
        'absolute top-2 left-2 z-above',
        'text-2xs font-bold uppercase tracking-wider',
        'px-2 py-1 rounded-full leading-none',
        badge === 'new'  && 'bg-green-500 text-white',
        badge === 'sale' && 'bg-danger     text-white',
        badge === 'hot'  && 'bg-primary    text-white',
        className
      )}
    >
      {LABELS[badge]}
    </span>
  )
}

// ── STOCK BADGE ───────────────────────────────────────────────

interface StockBadgeProps {
  stockQty: number
  className?: string
}

export function StockBadge({ stockQty, className }: StockBadgeProps) {
  if (stockQty > 5) {
    return (
      <Badge variant="in-stock" size="md" dot className={className}>
        In Stock
      </Badge>
    )
  }
  if (stockQty > 0) {
    return (
      <Badge variant="low-stock" size="md" dot className={className}>
        Only {stockQty} left
      </Badge>
    )
  }
  return (
    <Badge variant="out-stock" size="md" dot className={className}>
      Out of Stock
    </Badge>
  )
}

// ── CART COUNT BADGE (on nav icon) ───────────────────────────

interface CartBadgeProps {
  count: number
}

export function CartCountBadge({ count }: CartBadgeProps) {
  if (count === 0) return null

  return (
    <span
      aria-label={`${count} items in cart`}
      className={cn(
        'absolute -top-1.5 -right-1.5',
        'min-w-[18px] h-[18px] px-1',
        'bg-primary text-white',
        'text-2xs font-bold leading-none',
        'rounded-full flex items-center justify-center',
        'animate-fade-in-fast'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
