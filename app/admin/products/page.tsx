import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { formatKES } from '@/lib/utils'

export default async function AdminProductsPage({ searchParams }: { searchParams: { search?: string } }) {
  const supabase = createSupabaseServer()
  let query = supabase
    .from('products')
    .select('id,name,slug,brand,price,stock_qty,thumbnail,badge,is_active,is_featured,categories(name)')
    .order('created_at', { ascending: false })

  if (searchParams.search) query = query.ilike('name', `%${searchParams.search}%`)

  const { data: products } = await query.limit(100)

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold text-dark">Products</h1>
        <a href="/admin/products/new"
          className="h-10 px-5 bg-primary text-white font-semibold text-sm rounded-full flex items-center gap-2 hover:bg-primary-600 transition-colors">
          + Add Product
        </a>
      </div>

      <form method="get" className="mb-6">
        <input name="search" type="search" placeholder="Search products..."
          defaultValue={searchParams.search}
          className="w-full max-w-sm border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary bg-white" />
      </form>

      {/* Mobile: card list */}
      <div className="lg:hidden space-y-3">
        {(products ?? []).map((p: any) => (
          <div key={p.id} className="bg-white border border-border rounded-xl p-4 flex gap-3 items-center">
            <div className="w-14 h-14 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
              <img src={p.thumbnail ?? '/images/placeholder-product.svg'} alt={p.name}
                className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-dark text-sm truncate">{p.name}</p>
              <p className="text-xs text-muted">{p.categories?.name ?? '—'}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm font-bold text-dark">KES {p.price?.toLocaleString()}</p>
                <span className={`text-xs font-semibold ${p.stock_qty === 0 ? 'text-danger' : p.stock_qty < 5 ? 'text-warning' : 'text-success'}`}>
                  {p.stock_qty} in stock
                </span>
              </div>
            </div>
            <a href={`/admin/products/${p.id}/edit`}
              className="flex-shrink-0 h-9 px-4 bg-surface border border-border rounded-full text-xs font-semibold text-dark hover:border-primary hover:text-primary transition-colors flex items-center">
              Edit
            </a>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block bg-white border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Product</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Category</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Price</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(products ?? []).map((p: any) => (
              <tr key={p.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
                      <img src={p.thumbnail ?? '/images/placeholder-product.svg'} alt={p.name}
                        className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <p className="font-medium text-dark line-clamp-1">{p.name}</p>
                      {p.brand && <p className="text-xs text-muted">{p.brand}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.categories?.name ?? '—'}</td>
                <td className="px-4 py-3 font-semibold text-dark">KES {p.price?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${p.stock_qty === 0 ? 'text-danger' : p.stock_qty < 5 ? 'text-warning' : 'text-success'}`}>
                    {p.stock_qty}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a href={`/admin/products/${p.id}/edit`} className="text-xs text-primary hover:underline font-medium">Edit →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
