import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { parseDarajaCallback }       from '@/lib/daraja'

// Safaricom's known callback IP ranges (sandbox + production)
const SAFARICOM_IPS = [
  '196.201.214.200', '196.201.214.206', '196.201.213.114',
  '196.201.214.207', '196.201.214.208', '196.201.213.44',
  '196.201.212.127', '196.201.212.138', '196.201.212.129',
  '196.201.212.136', '196.201.212.74',  '196.201.212.69',
]

export async function POST(req: NextRequest) {
  // Validate the request comes from Safaricom
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp       = req.headers.get('x-real-ip')
  const clientIp     = forwardedFor?.split(',')[0].trim() ?? realIp ?? ''

  const isValidOrigin =
    process.env.DARAJA_ENVIRONMENT === 'sandbox' ||  // skip check in sandbox
    SAFARICOM_IPS.includes(clientIp)

  if (!isValidOrigin) {
    console.warn(`[M-Pesa Callback] Rejected IP: ${clientIp}`)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    // Return 200 even for invalid — Safaricom retries on failure
  }

  try {
    const body   = await req.json()
    const result = parseDarajaCallback(body)

    if (!result.checkoutId) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (result.success && result.receiptNumber) {
      // Find the most recent pending M-Pesa order
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_status', 'pending')
        .eq('payment_method', 'mpesa')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (order) {
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            mpesa_receipt:  result.receiptNumber,
            order_status:   'confirmed',
          })
          .eq('id', order.id)
      }
    } else {
      // Payment failed
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_status', 'pending')
        .eq('payment_method', 'mpesa')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (order) {
        await supabaseAdmin
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', order.id)
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })

  } catch (err) {
    console.error('[M-Pesa Callback]', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}