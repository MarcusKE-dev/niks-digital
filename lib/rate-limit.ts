// ════════════════════════════════════════════════════════════
// RATE LIMITING — fixed-window counter, in-process.
//
// Protects public endpoints from abuse (order spam, STK-push
// spam, admin brute force, status-polling floods).
//
// NOTE: state lives in the Node process, so each serverless
// instance keeps its own counters. That is enough to stop the
// single-attacker floods this app realistically faces. If the
// app is ever scaled out aggressively, swap the store below for
// Redis/Upstash — the call sites do not need to change.
// ════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Stop the map growing without bound under a distributed flood.
const MAX_BUCKETS = 10_000

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * Best-effort client IP. On Vercel/most proxies `x-forwarded-for`
 * is set by the platform; the left-most entry is the client.
 */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfter: number // seconds
}

/**
 * Consume one token for `key`. Returns ok:false once `limit`
 * requests have been made inside `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  if (buckets.size > MAX_BUCKETS) sweep(now)

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  existing.count += 1

  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  return { ok: true, remaining: limit - existing.count, retryAfter: 0 }
}

/**
 * Rate limit a request by IP. Returns a 429 NextResponse when the
 * caller is over budget, or null when the request may proceed.
 */
export function enforceRateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const result = rateLimit(`${scope}:${clientIp(req)}`, limit, windowMs)

  if (result.ok) return null

  return NextResponse.json(
    { error: 'Too many requests. Please slow down and try again shortly.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter),
        'Cache-Control': 'no-store',
      },
    }
  )
}
