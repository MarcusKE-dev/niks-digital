import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { generateOrderNumber }       from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items, customer_name, customer_phone, customer_email,
      delivery_area, delivery_address, notes, payment_method,
      subtotal, delivery_fee, total,
    } = body

    if (!items?.length || !customer_name || !customer_phone || !delivery_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── SECURITY: Recalculate prices from database ────────────────
    // Never trust prices sent from the client
    const productIds = items.map((i: any) => i.product_id).filter(Boolean)

    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, price, stock_qty, name')
      .in('id', productIds)

    if (prodErr || !products) {
      return NextResponse.json({ error: 'Failed to verify products' }, { status: 400 })
    }

    // Build verified items with server-side prices
    let calculatedSubtotal = 0
    const verifiedItems: any[] = []

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.product_id)

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        )
      }

      if (product.stock_qty < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for: ${product.name}` },
          { status: 400 }
        )
      }

      const lineTotal = product.price * item.quantity
      calculatedSubtotal += lineTotal

      verifiedItems.push({
        product_id:    item.product_id,
        product_name:  item.product_name,
        product_image: item.product_image,
        quantity:      item.quantity,
        unit_price:    product.price,         // server price, not client
        total_price:   lineTotal,
      })
    }

    // ── Generate order number ─────────────────────────────────────
    let order_number = generateOrderNumber()
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from('orders').select('id').eq('order_number', order_number).single()
      if (!existing) break
      order_number = generateOrderNumber()
      attempts++
    }

    // ── Insert order with server-calculated total ─────────────────
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        delivery_area:    delivery_area || null,
        delivery_address,
        notes:          notes || null,
        payment_method,
        subtotal:       calculatedSubtotal,
        delivery_fee:   0,
        total:          calculatedSubtotal,   // delivery added manually by admin
        payment_status: 'pending',
        order_status:   'new',
      })
      .select('id')
      .single()

    if (orderErr || !order) {
      console.error('[Orders] Insert error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // ── Insert order items ────────────────────────────────────────
    const { error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(verifiedItems.map(i => ({ ...i, order_id: order.id })))

    if (itemsErr) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 })
    }

    // ── Atomic stock decrement ────────────────────────────────────
    for (const item of verifiedItems) {
      const { data: decremented } = await supabaseAdmin
        .rpc('decrement_stock', {
          p_id: item.product_id,
          qty:  item.quantity,
        })

      if (!decremented) {
        // Stock ran out between check and decrement — race condition caught
        console.warn(`Stock decrement failed for ${item.product_id}`)
        // Order still goes through — admin handles it manually
        // In future: roll back order and notify customer
      }
    }

    return NextResponse.json({ orderId: order.id, order_number })

  } catch (err) {
    console.error('[Orders] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}