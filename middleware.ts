import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Paths that must stay reachable without a session, or the admin could
// never sign in / sign out.
const PUBLIC_ADMIN_PATHS = new Set([
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
])

function isProtected(pathname: string): boolean {
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return false
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtected(pathname)) return NextResponse.next()

  const isApi = pathname.startsWith('/api/')

  // An unauthenticated API call gets a 401, not an HTML login page.
  const deny = (reason: 'unauthenticated' | 'forbidden') => {
    if (isApi) {
      return NextResponse.json(
        { error: reason === 'forbidden' ? 'Forbidden' : 'Unauthorized' },
        { status: reason === 'forbidden' ? 403 : 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    const url = new URL('/admin/login', request.url)
    // Only ever redirect back to a path on this site.
    url.searchParams.set('redirectTo', pathname)
    if (reason === 'forbidden') url.searchParams.set('error', 'forbidden')
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as any)
          })
        },
      },
    }
  )

  // getUser() verifies the JWT with the auth server; getSession() would
  // simply trust whatever is in the cookie.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return deny('unauthenticated')

  // Being signed in is not enough — the account must be an admin.
  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !admin) return deny('forbidden')

  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
