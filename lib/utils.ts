// ════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// Pure helpers with no side effects.
// Import only what you need.
// ════════════════════════════════════════════════════════════

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import slugify from 'slugify'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_AREAS } from '@/types'
import type { DeliveryArea, OrderStatus, PaymentStatus } from '@/types'

// ── CLASSNAMES ───────────────────────────────────────────────

/**
 * Merge Tailwind classes intelligently.
 * Handles conditional classes and resolves conflicts.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-primary text-white', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ── CURRENCY ─────────────────────────────────────────────────

/**
 * Format a number as Kenyan Shillings.
 * e.g. formatKES(42000) → "KES 42,000"
 * e.g. formatKES(42000.50) → "KES 42,000.50"
 */
export function formatKES(amount: number): string {
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `KES ${formatted}`
}

/**
 * Calculate savings amount and percentage.
 * Returns null if no old price.
 */
export function calculateSavings(
  price: number,
  oldPrice: number | null
): { amount: number; percent: number } | null {
  if (!oldPrice || oldPrice <= price) return null

  const amount  = oldPrice - price
  const percent = Math.round((amount / oldPrice) * 100)

  return { amount, percent }
}

// ── DELIVERY ─────────────────────────────────────────────────

/**
 * Get the delivery fee for a given area and cart subtotal.
 * Free delivery applies when subtotal >= FREE_DELIVERY_THRESHOLD.
 */
export function getDeliveryFee(
  area: DeliveryArea | string,
  subtotal: number
): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0

  const found = DELIVERY_AREAS.find(a => a.value === area)
  return found?.fee ?? 300  // default fee if area not found
}

/**
 * Check if an order qualifies for free delivery.
 */
export function qualifiesForFreeDelivery(subtotal: number): boolean {
  return subtotal >= FREE_DELIVERY_THRESHOLD
}

// ── ORDER NUMBERS ────────────────────────────────────────────

/**
 * Generate a unique order number in the format NDC-2026-XXXX.
 * Uses current year + random 4-digit suffix.
 * Real uniqueness is enforced by the database UNIQUE constraint.
 */
export function generateOrderNumber(): string {
  const year   = new Date().getFullYear()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `NDC-${year}-${suffix}`
}

// ── DATES ────────────────────────────────────────────────────

/**
 * Format an ISO date string for display.
 * e.g. "15 May 2026, 10:30am"
 */
export function formatDate(isoString: string): string {
  return format(new Date(isoString), 'd MMM yyyy, h:mmaaa')
}

/**
 * Format as relative time.
 * e.g. "2 hours ago", "just now"
 */
export function formatRelative(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), { addSuffix: true })
}

/**
 * Format as short date only.
 * e.g. "15 May 2026"
 */
export function formatDateShort(isoString: string): string {
  return format(new Date(isoString), 'd MMM yyyy')
}

// ── SLUGS ────────────────────────────────────────────────────

/**
 * Convert a product/category name to a URL-safe slug.
 * e.g. "Samsung 55\" 4K Smart TV" → "samsung-55-4k-smart-tv"
 */
export function toSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,         // removes special chars
    trim: true,
  })
}

// ── STRINGS ──────────────────────────────────────────────────

/**
 * Truncate text to a max length and add ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Capitalise the first letter of each word.
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format a phone number for display.
 * e.g. "254798946124" → "+254 700 000 001"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }

  if (cleaned.startsWith('07') && cleaned.length === 10) {
    return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

/**
 * Normalize a Kenyan phone number to the 254XXXXXXXXX format
 * required by the Daraja API.
 *
 * Accepts: 07XXXXXXXX, +254XXXXXXXXX, 254XXXXXXXXX
 * Returns: 254XXXXXXXXX or null if invalid
 */
export function normalizeMpesaPhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('254') && cleaned.length === 12) return cleaned
  if (cleaned.startsWith('0')   && cleaned.length === 10) return '254' + cleaned.slice(1)
  if (cleaned.startsWith('7')   && cleaned.length === 9)  return '254' + cleaned

  return null
}

// ── STATUS LABELS ────────────────────────────────────────────

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new:        'New Order',
  confirmed:  'Confirmed',
  packed:     'Packed',
  dispatched: 'Dispatched',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
}

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new:        'bg-blue-50 text-blue-700',
  confirmed:  'bg-indigo-50 text-indigo-700',
  packed:     'bg-yellow-50 text-yellow-700',
  dispatched: 'bg-orange-50 text-orange-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
}

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending:  'bg-yellow-50 text-yellow-700',
  paid:     'bg-green-50 text-green-700',
  failed:   'bg-red-50 text-red-700',
  refunded: 'bg-purple-50 text-purple-700',
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status
}

export function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  return PAYMENT_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
}

// ── IMAGES ───────────────────────────────────────────────────

/**
 * Return a product placeholder if the image URL is empty.
 */
export function productImageSrc(url: string | null | undefined): string {
  if (!url || url.trim() === '') {
    return '/images/placeholder-product.svg'
  }
  return url
}

/**
 * Build an array of image URLs with fallback for missing slots.
 * Ensures there are always exactly `count` items.
 */
export function normalizeImages(images: string[], count = 4): string[] {
  const filled = [...images]
  while (filled.length < count) {
    filled.push('/images/placeholder-product.png')
  }
  return filled.slice(0, count)
}

// ── RATINGS ──────────────────────────────────────────────────

/**
 * Convert a decimal rating to an array suitable for rendering stars.
 * e.g. rating=4.5 → ['full','full','full','full','half','empty']
 * (Note: we always return 5 items)
 */
export type StarType = 'full' | 'half' | 'empty'

export function getRatingStars(rating: number): StarType[] {
  const stars: StarType[] = []
  const floored = Math.floor(rating)
  const hasHalf = rating - floored >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < floored)               stars.push('full')
    else if (i === floored && hasHalf) stars.push('half')
    else                           stars.push('empty')
  }

  return stars
}

// ── MISC ─────────────────────────────────────────────────────

/**
 * Generate a random UUID (v4) for client-side use.
 * For DB records, always rely on Supabase's uuid_generate_v4().
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Delay execution (for testing loading states, throttling).
 * Usage: await sleep(1000)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Safe JSON parse — returns null instead of throwing.
 */
export function safeJsonParse<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T
  } catch {
    return null
  }
}
