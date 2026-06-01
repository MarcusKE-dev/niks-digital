import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient }             from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // Check session exists
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(
      new URL(`/admin/login?redirectTo=${pathname}`, request.url)
    )
  }

  // Check admin role using our admins table
  const { data: adminRecord } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!adminRecord) {
    // Authenticated but not an admin — sign them out and redirect
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL('/admin/login?error=unauthorized', request.url)
    )
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}