import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(c => 
    c.name.includes('auth-token') || 
    c.name.includes('supabase')
  )

  if (!hasSession) {
    return NextResponse.redirect(
      new URL(`/admin/login?redirectTo=${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
