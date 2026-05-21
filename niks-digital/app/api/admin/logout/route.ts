import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer }      from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/admin/login', req.url))
}
