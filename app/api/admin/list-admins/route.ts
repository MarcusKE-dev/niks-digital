import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireOwner } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { jsonOk, serverError } from '@/lib/security'

export async function GET(req: NextRequest) {
  const guard = await requireOwner()
  if (!guard.ok) return guard.response

  const limited = enforceRateLimit(req, 'admin-list-admins', 60, 60_000)
  if (limited) return limited

  // Only the columns the UI renders — `select('*')` would expose any
  // column later added to this table.
  const { data: admins, error } = await supabaseAdmin
    .from('admins')
    .select('id,user_id,email,created_at')
    .order('created_at', { ascending: false })

  if (error) return serverError('List Admins', error, 'Failed to load admins')

  return jsonOk({ admins: admins ?? [] })
}
