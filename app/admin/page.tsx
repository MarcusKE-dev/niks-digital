import Link                   from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { formatKES, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = createSupabaseServer()
const { data: { user } } = await supabase.auth.getUser()
  console.log('[dashboard] user:', user?.email || 'none')
  const [{ count: totalOrders }, { count: totalProducts }, { data: recentOrders }, { data: lowStock }] =
    await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('id,order_number,customer_name,total,order_status,payment_status,created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('products').select('id,name,stock_qty').eq('is_active', true).lt('stock_qty', 5).order('stock_qty').limit(5),
    ])

  const { data: revenueData } = await supabase.from('orders').select('total').eq('payment_status', 'paid')
  const revenue = (revenueData ?? []).reduce((s, o) => s + Number(o.total), 0)

  const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'new')

  const STATS = [
    { label: 'Total Orders',    value: totalOrders ?? 0,           icon: '🛒', color: 'bg-blue-50   border-blue-200' },
    { label: 'Revenue (Paid)',  value: formatKES(revenue),         icon: '💰', color: 'bg-green-50  border-green-200' },
    { label: 'Active Products', value: totalProducts ?? 0,         icon: '📦', color: 'bg-orange-50 border-orange-200' },
    { label: 'Pending Orders',  value: pendingCount ?? 0,          icon: '⏳', color: 'bg-red-50    border-red-200' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">Welcome back. Here's what's happening.</p>
        </div>
        <Link href="/admin/products/new" className="h-10 px-5 bg-primary text-white font-semibold text-sm rounded-full flex items-center gap-2 hover:bg-primary-600 transition-colors">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className={`border rounded-xl p-5 ${s.color}`}>
            <p className="text-2xl mb-2" aria-hidden>{s.icon}</p>
            <p className="text-2xl font-extrabold text-dark">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-extrabold text-dark">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {['Order #','Customer','Total','Payment','Status','Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(recentOrders ?? []).map((o: any) => (
                  <tr key={o.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-bold text-dark hover:text-primary">{o.order_number}</Link></td>
                    <td className="px-4 py-3 text-dark">{o.customer_name}</td>
                    <td className="px-4 py-3 font-semibold text-dark">{formatKES(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusColor(o.order_status)}`}>
                        {getOrderStatusLabel(o.order_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-extrabold text-dark">⚠️ Low Stock</h2>
            <Link href="/admin/products" className="text-xs text-primary hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-border">
            {(lowStock ?? []).length === 0 ? (
              <p className="p-5 text-sm text-muted text-center">All products well stocked ✓</p>
            ) : (lowStock ?? []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <p className="text-sm text-dark line-clamp-1">{p.name}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock_qty === 0 ? 'bg-red-100 text-danger' : 'bg-orange-100 text-orange-700'}`}>
                  {p.stock_qty === 0 ? 'Out' : `${p.stock_qty} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
