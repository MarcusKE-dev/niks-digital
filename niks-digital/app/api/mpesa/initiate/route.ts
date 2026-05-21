// app/api/mpesa/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { initiateStkPush }           from '@/lib/daraja'

export async function POST(req: NextRequest) {
  try {
    const { orderId, phone, amount } = await req.json()

    if (!orderId || !phone || !amount) {
      return NextResponse.json({ error: 'orderId, phone and amount are required' }, { status: 400 })
    }

    // Verify order exists
    const { data: order } = await supabaseAdmin
      .from('orders').select('id,order_number').eq('id', orderId).single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const result = await initiateStkPush({ phone, amount, orderNumber: order.order_number })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ checkoutRequestId: result.checkoutRequestId })

  } catch (err) {
    console.error('[M-Pesa Initiate]', err)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}
