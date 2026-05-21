// ════════════════════════════════════════════════════════════
// MIDDLEWARE — middleware.ts
//
// Runs on every request before the page renders.
// Two jobs:
//   1. Refresh the Supabase auth session cookie so it doesn't expire
//   2. Protect /admin routes — redirect to /admin/login if not signed in
//
// This file MUST stay at the project root (same level as /app).
// ════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Create a response we can modify (to set refreshed cookies)
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ── Create Supabase server client ─────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          // Set cookies on both request and response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // ── Refresh the session ───────────────────────────────────
  // This keeps the user logged in as long as they're active.
  // IMPORTANT: Always call getUser() not getSession() for security.
  const { data: { user } } = await supabase.auth.getUser()

  // ── Protect /admin routes ─────────────────────────────────
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    // Allow /admin/login without auth
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (user) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return response
    }

    // All other /admin/* routes require authentication
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      // Preserve the intended destination to redirect back after login
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Redirect /products → /shop (SEO clean URLs) ──────────
  if (pathname.startsWith('/products')) {
    const newPath = pathname.replace('/products', '/shop')
    return NextResponse.redirect(new URL(newPath, request.url), 301)
  }

  return response
}

// ── MATCHER — which paths run through middleware ──────────────
// We exclude:
//   - Static files (_next/static, images, etc.)
//   - API routes (handled separately)
//   - Favicon and other public files
//
// Everything else (pages) runs through middleware.

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (Next.js build files)
     * - _next/image (image optimisation)
     * - favicon.ico, site.webmanifest
     * - Public assets (png, jpg, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
