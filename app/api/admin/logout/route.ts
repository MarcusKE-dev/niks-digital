import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { verifySameOrigin } from '@/lib/security'

export async function POST(req: NextRequest) {
  // Stops a cross-site page from signing the admin out mid-task.
  const origin = verifySameOrigin(req)
  if (origin) return origin

  const supabase = createSupabaseServer()
  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/admin/login', req.url), { status: 303 })
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response
}
