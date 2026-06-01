import { createSupabaseServer } from '@/lib/supabase-server'
import { supabaseAdmin }        from '@/lib/supabase-admin'

/**
 * Verifies the current request comes from an admin.
 * Returns { userId, error } — check error first.
 */
export async function requireAdmin(): Promise<{ userId: string | null; error: string | null }> {
  const supabase = createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { userId: null, error: 'Not authenticated' }
  }

  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!admin) {
    return { userId: null, error: 'Not authorized' }
  }

  return { userId: session.user.id, error: null }
}