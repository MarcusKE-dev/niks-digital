import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  // Verify admin
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(',')[0] || 'mwaura.ke.john@gmail.com'
  if (user.email !== ALLOWED_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: admins } = await supabaseAdmin
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ admins: admins ?? [] })
}