// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { parseDarajaCallback } from '@/lib/daraja'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const SAFARICOM_IPS = [
  '196.201.214.200', '196.201.214.206', '196.201.213.114',
  '196.201.214.207', '196.201.214.208', '196.201.213.44',
  '196.201.212.127', '196.201.212.138', '196.201.212.129',
  '196.201.212.136', '196.201.212.74',  '196.201.212.69',
]

// Safaricom retries on anything that is not a 200, so every path here
// answers "Accepted" regardless of what we actually did. It also means
// a rejection tells an attacker nothing.
const ACCEPTED = { ResultCode: 0, ResultDesc: 'Accepted' }
const accepted = () => NextResponse.json(ACCEPTED, { headers: { 'Cache-Control': 'no-store' } })

export async function POST(req: NextRequest) {
  const ip = clientIp(req)

  // A forged callback can mark an order paid, so the sandbox bypass is
  // only ever allowed off production — a misconfigured DARAJA_ENVIRONMENT
  // must not leave this endpoint open on the live site.
  const isValidOrigin =
    SAFARICOM_IPS.includes(ip) ||
    (process.env.NODE_ENV !== 'production' && process.env.DARAJA_ENVIRONMENT === 'sandbox')

  if (!isValidOrigin) {
    console.warn(`[M-Pesa Callback] Rejected IP: ${ip}`)
    return accepted()
  }

  // Generous, but stops a spoofed-IP flood from hammering the database.
  if (!rateLimit(`mpesa-callback:${ip}`, 120, 60_000).ok) {
    console.warn(`[M-Pesa Callback] Rate limited: ${ip}`)
    return accepted()
  }

  try {
    const body = await req.json()
    const result = parseDarajaCallback(body)

    if (!result.checkoutId) return accepted()

    // Find the order by mpesa_checkout_id (not "most recent").
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, total, payment_status')
      .eq('mpesa_checkout_id', result.checkoutId)
      .maybeSingle()

    if (!order) return accepted()

    // Never downgrade an order that is already settled.
    if (order.payment_status === 'paid') return accepted()

    if (result.success && result.receiptNumber) {
      // Confirm Safaricom actually collected what the order is worth.
      // Without this, a partial payment would still flip the order to paid.
      const paid = Number(result.amount)
      const owed = Number(order.total)

      if (!Number.isFinite(paid) || paid + 0.01 < owed) {
        console.warn(
          `[M-Pesa Callback] Amount mismatch on order ${order.id}: paid ${paid}, owed ${owed}`
        )
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'pending',
            mpesa_receipt: result.receiptNumber,
            notes: `Underpaid via M-Pesa: received ${paid}, expected ${owed}. Needs review.`,
          })
          .eq('id', order.id)
        return accepted()
      }

      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          mpesa_receipt: result.receiptNumber,
          order_status: 'confirmed',
        })
        .eq('id', order.id)
    } else {
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id)
    }

    return accepted()
  } catch (err) {
    console.error('[M-Pesa Callback]', err)
    return accepted()
  }
}
