import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isUuid, jsonError, jsonOk } from '@/lib/security'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // The customer's browser polls this while waiting for an STK push,
  // so it stays unauthenticated — but it is capped so it cannot be used
  // to enumerate order IDs or to flood the database.
  const limited = enforceRateLimit(req, 'order-status', 120, 60_000)
  if (limited) return limited

  if (!isUuid(params.id)) return jsonError('Not found', 404)

  // Deliberately narrow: no customer details, no totals — only what the
  // waiting screen needs.
  const { data } = await supabaseAdmin
    .from('orders')
    .select('id,payment_status,order_status')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) return jsonError('Not found', 404)

  return jsonOk(data)
}
