import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { parseDarajaCallback } from '@/lib/daraja'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = parseDarajaCallback(body)

    if (!result.checkoutId) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'No checkout ID' })
    }

    // Extract order number from AccountReference
    const callback = body?.Body?.stkCallback
    const orderNumber = callback?.ReferenceData?.ReferenceItem?.find((item: any) => item.Key === 'AccountReference')?.Value
      || callback?.AccountReference

    if (!orderNumber) {
      console.error('[M-Pesa Callback] No order number found')
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'No order number' })
    }

    if (result.success && result.receiptNumber) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          mpesa_receipt: result.receiptNumber,
          order_status: 'confirmed',
        })
        .eq('order_number', orderNumber)

      if (error) console.error('[M-Pesa] Update error:', error)
    } else {
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('order_number', orderNumber)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('[M-Pesa Callback]', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
