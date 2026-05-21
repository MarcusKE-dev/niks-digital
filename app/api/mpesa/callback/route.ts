import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { parseDarajaCallback }       from '@/lib/daraja'

// Safaricom posts to this URL after the customer enters their PIN
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const result = parseDarajaCallback(body)

    if (!result.checkoutId) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'No checkout ID' })
    }

    if (result.success && result.receiptNumber) {
      // Find order by order_number embedded in the AccountReference
      // We stored order_number in the STK push AccountReference field
      // Simplest approach: query by mpesa receipt or update by checkout metadata
      // For now we match on the most recent pending mpesa order
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          mpesa_receipt:  result.receiptNumber,
          order_status:   'confirmed',
        })
        .eq('payment_status', 'pending')
        .eq('payment_method', 'mpesa')
        .order('created_at', { ascending: false })
        .limit(1)
    } else {
      // Payment failed — mark it
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('payment_status', 'pending')
        .eq('payment_method', 'mpesa')
        .order('created_at', { ascending: false })
        .limit(1)
    }

    // Safaricom expects this exact response shape
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })

  } catch (err) {
    console.error('[M-Pesa Callback]', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
