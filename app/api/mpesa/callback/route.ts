// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { parseDarajaCallback } from '@/lib/daraja'

const SAFARICOM_IPS = [
  '196.201.214.200', '196.201.214.206', '196.201.213.114',
  '196.201.214.207', '196.201.214.208', '196.201.213.44',
  '196.201.212.127', '196.201.212.138', '196.201.212.129',
  '196.201.212.136', '196.201.212.74',  '196.201.212.69',
]

export async function POST(req: NextRequest) {
  // IP check (skip in sandbox)
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const clientIp = forwardedFor?.split(',')[0].trim() ?? realIp ?? ''

  const isValidOrigin =
    process.env.DARAJA_ENVIRONMENT === 'sandbox' ||
    SAFARICOM_IPS.includes(clientIp)

  if (!isValidOrigin) {
    console.warn(`[M-Pesa Callback] Rejected IP: ${clientIp}`)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  try {
    const body = await req.json()
    const result = parseDarajaCallback(body)

    if (!result.checkoutId) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // ✅ Find order by mpesa_checkout_id (not “most recent”)
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('mpesa_checkout_id', result.checkoutId)
      .maybeSingle()

    if (!order) {
      // No matching order – ignore
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (result.success && result.receiptNumber) {
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

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('[M-Pesa Callback]', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}