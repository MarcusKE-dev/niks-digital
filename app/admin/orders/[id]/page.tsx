import { notFound }            from 'next/navigation'
import Link                    from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { formatKES, formatDate, getOrderStatusColor, getOrderStatusLabel, getPaymentStatusColor } from '@/lib/utils'
import { OrderActions }         from '@/components/admin/OrderActions'

interface PageProps { params: { id: string } }

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const supabase = createSupabaseServer()
  const { data: order } = await supabase
    .from('orders')
    .select('*,order_items(*)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const items = order.order_items ?? []

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-sm text-muted hover:text-primary">← Orders</Link>
          <span className="text-muted">/</span>
          <h1 className="text-xl font-extrabold text-dark">{order.order_number}</h1>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getOrderStatusColor(order.order_status)}`}>
            {getOrderStatusLabel(order.order_status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Order items */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-extrabold text-dark">Order Items</h2>
              <p className="text-xs text-muted mt-0.5">{formatDate(order.created_at)}</p>
            </div>
            <div className="divide-y divide-border">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-3 p-4 items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark">{item.product_name}</p>
                    <p className="text-xs text-muted mt-0.5">Qty: {item.quantity} × {formatKES(item.unit_price)}</p>
                  </div>
                  <p className="text-sm font-bold text-dark">{formatKES(item.total_price)}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface p-4 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatKES(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{order.delivery_fee === 0 ? 'Free' : formatKES(order.delivery_fee)}</span></div>
              <div className="flex justify-between font-extrabold text-dark text-base pt-1 border-t border-border">
                <span>Total</span><span className="text-primary">{formatKES(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery details */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="font-extrabold text-dark mb-4">Delivery Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Customer</p>
                <p className="font-medium text-dark">{order.customer_name}</p>
                <p className="text-muted">{order.customer_phone}</p>
                {order.customer_email && <p className="text-muted text-xs">{order.customer_email}</p>}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Address</p>
                <p className="text-dark leading-snug">{order.delivery_address}</p>
                {order.delivery_area && <p className="text-muted text-xs mt-0.5 capitalize">{order.delivery_area.replace(/_/g, ' ')}</p>}
              </div>
              {order.notes && (
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Notes</p>
                  <p className="text-dark bg-surface border border-border rounded-lg px-3 py-2 text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — actions */}
        <div className="space-y-4">
          <OrderActions order={order} />
        </div>
      </div>
    </div>
  )
}