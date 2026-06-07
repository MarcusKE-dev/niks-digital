import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(',')[0] || 'mwaura.ke.john@gmail.com'
  if (user.email !== ALLOWED_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

  // Remove from admins table (do not delete auth user)
  const { error } = await supabaseAdmin
    .from('admins')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Remove admin error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}