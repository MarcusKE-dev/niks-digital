import Link                   from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { formatKES, formatDate, getOrderStatusColor, getOrderStatusLabel, getPaymentStatusColor } from '@/lib/utils'

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createSupabaseServer()
  let query = supabase.from('orders')
    .select('id,order_number,customer_name,customer_phone,total,payment_method,payment_status,order_status,created_at')
    .order('created_at', { ascending: false })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('order_status', searchParams.status)
  }

  const { data: orders } = await query.limit(100)

  const TABS = ['all','new','confirmed','packed','dispatched','delivered','cancelled']
  const active = searchParams.status ?? 'all'

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold text-dark mb-6">Orders</h1>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <Link key={tab} href={`/admin/orders${tab !== 'all' ? `?status=${tab}` : ''}`}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap capitalize border-b-2 -mb-px transition-colors ${active === tab ? 'text-dark border-primary' : 'text-muted border-transparent hover:text-dark'}`}>
            {tab === 'all' ? 'All Orders' : getOrderStatusLabel(tab as any)}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {['Order #','Customer','Phone','Total','Payment','Status','Date',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(orders ?? []).map((o: any) => (
              <tr key={o.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-bold text-dark">{o.order_number}</td>
                <td className="px-4 py-3 text-dark">{o.customer_name}</td>
                <td className="px-4 py-3 text-muted">{o.customer_phone}</td>
                <td className="px-4 py-3 font-semibold text-dark">{formatKES(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusColor(o.payment_status)}`}>
                    {o.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusColor(o.order_status)}`}>
                    {getOrderStatusLabel(o.order_status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-xs text-primary hover:underline font-medium">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders ?? []).length === 0 && <p className="text-center py-12 text-muted text-sm">No orders found.</p>}
      </div>
    </div>
  )
}
