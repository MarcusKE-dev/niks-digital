// ════════════════════════════════════════════════════════════
// SECURITY HELPERS — shared by the API routes.
// ════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

/** Never let a browser or CDN cache an authenticated / mutating response. */
export const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' } as const

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: NO_STORE })
}

export function jsonOk(body: Record<string, unknown>) {
  return NextResponse.json(body, { headers: NO_STORE })
}

/**
 * Log the real error server-side, return a generic message to the
 * caller. Database and upstream messages routinely leak schema and
 * infrastructure details, so they must never reach the client.
 */
export function serverError(
  scope: string,
  err: unknown,
  publicMessage = 'Something went wrong. Please try again.'
) {
  console.error(`[${scope}]`, err)
  return jsonError(publicMessage, 500)
}

/**
 * Same-origin check for state-changing requests.
 *
 * Supabase keeps its session in cookies, so any cross-site form or
 * fetch would otherwise ride along with the admin's credentials.
 * Browsers always send Origin on cross-origin requests and on every
 * non-GET fetch, so a mismatch — or no Origin/Referer at all — means
 * the request did not come from this site.
 */
export function verifySameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')

  // The host the request actually arrived on.
  const host = req.headers.get('host')
  if (!host) return jsonError('Bad request', 400)

  const allowedHosts = new Set<string>([host])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    try {
      allowedHosts.add(new URL(siteUrl).host)
    } catch {
      /* ignore malformed config */
    }
  }

  const candidate = origin ?? referer
  if (!candidate) {
    // No Origin and no Referer: not a browser-initiated request from
    // this site. Every legitimate caller here is a browser.
    return jsonError('Invalid request origin', 403)
  }

  try {
    if (!allowedHosts.has(new URL(candidate).host)) {
      return jsonError('Invalid request origin', 403)
    }
  } catch {
    return jsonError('Invalid request origin', 403)
  }

  return null
}

/** Parse a JSON body defensively — a malformed body must not 500. */
export async function readJson<T = unknown>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T
  } catch {
    return null
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

// Tag delimiters and ASCII control characters.
const MARKUP_RE = /[<>]/g
const CONTROL_RE = new RegExp('[\\u0000-\\u001F\\u007F]', 'g')

/**
 * Strip anything that could be interpreted as markup and clamp the
 * length. Applied to free text the customer controls before it is
 * stored and later rendered in the admin panel.
 */
export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(MARKUP_RE, '')
    .replace(CONTROL_RE, ' ')
    .trim()
    .slice(0, maxLength)
}
