// app/api/mpesa/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { initiateStkPush } from '@/lib/daraja'

export async function POST(req: NextRequest) {
  try {
    const { orderId, phone, amount } = await req.json()

    if (!orderId || !phone || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Get order number
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const result = await initiateStkPush({ phone, amount, orderNumber: order.order_number })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // ✅ Save the CheckoutRequestID to link callback
    await supabaseAdmin
      .from('orders')
      .update({ mpesa_checkout_id: result.checkoutRequestId })
      .eq('id', orderId)

    return NextResponse.json({ checkoutRequestId: result.checkoutRequestId })
  } catch (err) {
    console.error('[M-Pesa Initiate]', err)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}