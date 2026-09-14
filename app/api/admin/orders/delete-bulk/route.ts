import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isUuid, jsonError, jsonOk, readJson, serverError, verifySameOrigin } from '@/lib/security'

const MAX_BULK = 100

export async function POST(req: NextRequest) {
  const origin = verifySameOrigin(req)
  if (origin) return origin

  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const limited = enforceRateLimit(req, 'admin-bulk-delete', 10, 60_000)
  if (limited) return limited

  const body = await readJson<{ ids?: unknown }>(req)
  const ids = body?.ids

  if (!Array.isArray(ids) || ids.length === 0) {
    return jsonError('No order IDs provided', 400)
  }

  if (ids.length > MAX_BULK) {
    return jsonError(`Cannot delete more than ${MAX_BULK} orders at once`, 400)
  }

  // Reject the whole batch on a single bad id rather than guessing.
  if (!ids.every(isUuid)) {
    return jsonError('Invalid order ID', 400)
  }

  const { error } = await supabaseAdmin.from('orders').delete().in('id', ids)

  if (error) return serverError('Bulk Delete', error, 'Failed to delete orders')

  return jsonOk({ success: true, count: ids.length })
}
