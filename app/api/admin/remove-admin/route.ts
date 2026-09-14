import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isOwnerEmail, requireOwner } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isUuid, jsonError, jsonOk, readJson, serverError, verifySameOrigin } from '@/lib/security'

export async function POST(req: NextRequest) {
  const origin = verifySameOrigin(req)
  if (origin) return origin

  const guard = await requireOwner()
  if (!guard.ok) return guard.response

  const limited = enforceRateLimit(req, 'admin-remove-admin', 20, 60 * 60_000)
  if (limited) return limited

  const body = await readJson<{ userId?: unknown }>(req)
  if (!isUuid(body?.userId)) return jsonError('Valid user ID required', 400)

  const userId = body.userId

  // Locking yourself out of the panel is not recoverable from the UI.
  if (userId === guard.ctx.user.id) {
    return jsonError('You cannot remove your own admin access', 400)
  }

  // Nor may the owner account be demoted by anyone.
  const { data: target } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('user_id', userId)
    .maybeSingle()

  if (target && isOwnerEmail(target.email)) {
    return jsonError('The owner account cannot be removed', 400)
  }

  // Remove from admins table (the auth user is left intact).
  const { error } = await supabaseAdmin.from('admins').delete().eq('user_id', userId)

  if (error) return serverError('Remove Admin', error, 'Failed to remove admin')

  return jsonOk({ success: true })
}
