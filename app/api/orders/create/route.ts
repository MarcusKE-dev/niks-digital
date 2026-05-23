import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { generateOrderNumber }       from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customer_name, customer_phone, customer_email,
            delivery_area, delivery_address, notes, payment_method,
            mpesa_phone, subtotal, delivery_fee, total } = body

    if (!items?.length || !customer_name || !customer_phone || !delivery_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate order number with collision retry
    let order_number = generateOrderNumber()
    let attempts     = 0
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from('orders').select('id').eq('order_number', order_number).single()
      if (!existing) break
      order_number = generateOrderNumber()
      attempts++
    }

    // Insert order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number, customer_name, customer_phone,
        customer_email: customer_email || null,
        delivery_area, delivery_address,
        notes: notes || null,
        payment_method, subtotal, delivery_fee, total,
        payment_status: 'pending',
        order_status:   'new',
      })
      .select('id')
      .single()

    if (orderErr || !order) {
      console.error('[Orders] Insert error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert line items
    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(
      items.map((i: any) => ({ ...i, order_id: order.id }))
    )

    if (itemsErr) {
      console.error('[Orders] Items insert error:', itemsErr)
      // Clean up orphan order
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 })
    }

    for (const item of items) {
  if (item.product_id) {
    await supabaseAdmin.rpc('decrement_stock', {
      p_id: item.product_id,
      qty:  item.quantity,
    })
  }
}

return NextResponse.json({ orderId: order.id, order_number })

  } catch (err) {
    console.error('[Orders] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
