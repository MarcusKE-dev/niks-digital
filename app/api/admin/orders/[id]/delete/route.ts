import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isUuid, jsonError, jsonOk, serverError, verifySameOrigin } from '@/lib/security'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const origin = verifySameOrigin(req)
  if (origin) return origin

  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const limited = enforceRateLimit(req, 'admin-delete-order', 30, 60_000)
  if (limited) return limited

  if (!isUuid(params.id)) return jsonError('Invalid order ID', 400)

  const { error } = await supabaseAdmin.from('orders').delete().eq('id', params.id)

  if (error) return serverError('Delete Order', error, 'Failed to delete order')

  return jsonOk({ success: true })
}
