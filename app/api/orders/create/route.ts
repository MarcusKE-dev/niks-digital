import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateOrderNumber } from '@/lib/utils'
import { enforceRateLimit } from '@/lib/rate-limit'
import { jsonError, jsonOk, readJson, sanitizeText, serverError } from '@/lib/security'

const MAX_LINE_ITEMS = 30
const MAX_QTY_PER_LINE = 50

// Only the fields the server actually trusts from the client. Prices,
// names and images are all re-read from the database below, so an
// attacker cannot set a price, inject markup into the admin panel via
// a product name, or point product_image at a URL they control.
const bodySchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
      })
    )
    .min(1, 'Your cart is empty')
    .max(MAX_LINE_ITEMS, 'Too many items in one order'),

  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z
    .string()
    .trim()
    .regex(/^(\+?254|0)[17]\d{8}$/, 'Enter a valid Kenyan phone number'),
  customer_email: z.string().trim().email().max(254).optional().or(z.literal('')),

  delivery_area: z.string().trim().max(100).optional().or(z.literal('')),
  delivery_address: z.string().trim().min(5).max(500),
  notes: z.string().trim().max(500).optional().or(z.literal('')),

  payment_method: z.enum(['mpesa', 'cash']),
})

export async function POST(req: NextRequest) {
  // A checkout is a slow, deliberate action. This is generous for a
  // real shopper and still stops an order flood.
  const limited = enforceRateLimit(req, 'orders-create', 15, 10 * 60_000)
  if (limited) return limited

  try {
    const parsed = bodySchema.safeParse(await readJson(req))
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? 'Invalid order details', 400)
    }

    const body = parsed.data

    // Merge duplicate lines for the same product before checking stock,
    // otherwise splitting a quantity across lines would slip past the
    // per-line stock check.
    const quantities = new Map<string, number>()
    for (const item of body.items) {
      quantities.set(item.product_id, (quantities.get(item.product_id) ?? 0) + item.quantity)
    }

    const productIds = [...quantities.keys()]

    // ── SECURITY: every price comes from the database ──────────────
    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, price, stock_qty, name, thumbnail, is_active')
      .in('id', productIds)

    if (prodErr || !products) {
      return serverError('Orders', prodErr, 'Failed to verify products')
    }

    let calculatedSubtotal = 0
    const verifiedItems: Array<Record<string, unknown>> = []

    for (const [productId, quantity] of quantities) {
      const product = products.find(p => p.id === productId)

      // Do not echo the submitted id back — keep responses uniform so
      // this endpoint cannot be used to enumerate the catalogue.
      if (!product || !product.is_active) {
        return jsonError('One of the products is no longer available', 400)
      }

      if (product.stock_qty < quantity) {
        return jsonError(`Insufficient stock for: ${product.name}`, 400)
      }

      const unitPrice = Number(product.price)
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return serverError('Orders', `Bad price on product ${product.id}`, 'Failed to price this order')
      }

      const lineTotal = unitPrice * quantity
      calculatedSubtotal += lineTotal

      verifiedItems.push({
        product_id: product.id,
        product_name: product.name,       // server copy, not the client's
        product_image: product.thumbnail, // server copy, not the client's
        quantity,
        unit_price: unitPrice,
        total_price: lineTotal,
      })
    }

    // ── Generate order number ─────────────────────────────────────
    let order_number = generateOrderNumber()
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_number', order_number)
        .maybeSingle()
      if (!existing) break
      order_number = generateOrderNumber()
    }

    // ── Insert order with server-calculated total ─────────────────
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name: sanitizeText(body.customer_name, 100),
        customer_phone: body.customer_phone,
        customer_email: body.customer_email || null,
        delivery_area: sanitizeText(body.delivery_area, 100) || null,
        delivery_address: sanitizeText(body.delivery_address, 500),
        notes: sanitizeText(body.notes, 500) || null,
        payment_method: body.payment_method,
        subtotal: calculatedSubtotal,
        delivery_fee: 0,
        total: calculatedSubtotal, // delivery added manually by admin
        payment_status: 'pending',
        order_status: 'new',
      })
      .select('id')
      .single()

    if (orderErr || !order) {
      return serverError('Orders', orderErr, 'Failed to create order')
    }

    // ── Insert order items ────────────────────────────────────────
    const { error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(verifiedItems.map(i => ({ ...i, order_id: order.id })))

    if (itemsErr) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return serverError('Orders', itemsErr, 'Failed to save order items')
    }

    // ── Atomic stock decrement ────────────────────────────────────
    for (const item of verifiedItems) {
      const { data: decremented } = await supabaseAdmin.rpc('decrement_stock', {
        p_id: item.product_id,
        qty: item.quantity,
      })

      if (!decremented) {
        // Stock ran out between the check above and this decrement.
        // The order still stands; the admin reconciles it manually.
        console.warn(`[Orders] Stock decrement failed for ${item.product_id}`)
      }
    }

    return jsonOk({ orderId: order.id, order_number })
  } catch (err) {
    return serverError('Orders', err)
  }
}
