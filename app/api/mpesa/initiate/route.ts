// app/api/mpesa/initiate/route.ts
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { initiateStkPush } from '@/lib/daraja'
import { normalizeMpesaPhone } from '@/lib/utils'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isUuid, jsonError, jsonOk, readJson, serverError, verifySameOrigin } from '@/lib/security'

export async function POST(req: NextRequest) {
  const origin = verifySameOrigin(req)
  if (origin) return origin

  // An STK push rings a real phone and costs money. Without a cap this
  // endpoint is a free SMS/USSD flood against any number an attacker
  // chooses.
  const limited = enforceRateLimit(req, 'mpesa-initiate', 5, 10 * 60_000)
  if (limited) return limited

  try {
    const body = await readJson<{ orderId?: unknown; phone?: unknown }>(req)

    if (!isUuid(body?.orderId)) {
      return jsonError('Valid order ID required', 400)
    }

    const phone = normalizeMpesaPhone(typeof body?.phone === 'string' ? body.phone : '')
    if (!phone) {
      return jsonError('Enter a valid M-Pesa phone number', 400)
    }

    // ── SECURITY: the amount comes from the order, never the client ──
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, payment_status')
      .eq('id', body.orderId)
      .maybeSingle()

    if (orderErr || !order) {
      return jsonError('Order not found', 404)
    }

    if (order.payment_status === 'paid') {
      return jsonError('This order has already been paid', 400)
    }

    const amount = Math.ceil(Number(order.total))
    if (!Number.isFinite(amount) || amount < 1) {
      return jsonError('This order has no payable amount', 400)
    }

    // A second, per-order cap: rate limiting by IP alone would still
    // let a rotating-IP attacker hammer one customer's order.
    const perOrder = enforceRateLimit(req, `mpesa-order:${order.id}`, 3, 10 * 60_000)
    if (perOrder) return perOrder

    const result = await initiateStkPush({
      phone,
      amount,
      orderNumber: order.order_number,
    })

    if (!result.success) {
      console.error('[M-Pesa Initiate] STK push failed:', result.error)
      return jsonError('Could not start the M-Pesa payment. Please try again.', 400)
    }

    // Save the CheckoutRequestID so the callback can find this order.
    await supabaseAdmin
      .from('orders')
      .update({ mpesa_checkout_id: result.checkoutRequestId })
      .eq('id', order.id)

    return jsonOk({ checkoutRequestId: result.checkoutRequestId })
  } catch (err) {
    return serverError('M-Pesa Initiate', err, 'Failed to initiate payment')
  }
}
