import Link                   from 'next/link'
import Image                  from 'next/image'
import { createSupabaseServer } from '@/lib/supabase-server'
import { formatKES, productImageSrc } from '@/lib/utils'

export default async function AdminProductsPage({ searchParams }: { searchParams: { search?: string } }) {
  const supabase = createSupabaseServer()
  let query = supabase
    .from('products')
    .select('id,name,slug,brand,price,stock_qty,thumbnail,badge,is_active,is_featured,categories(name)')
    .order('created_at', { ascending: false })

  if (searchParams.search) query = query.ilike('name', `%${searchParams.search}%`)

  const { data: products } = await query.limit(100)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold text-dark">Products</h1>
        <Link href="/admin/products/new" className="h-10 px-5 bg-primary text-white font-semibold text-sm rounded-full flex items-center gap-2 hover:bg-primary-600 transition-colors">
          + Add Product
        </Link>
      </div>

      {/* Search */}
      <form method="get" className="mb-6">
        <input name="search" type="search" placeholder="Search products…" defaultValue={searchParams.search}
          className="w-full max-w-sm border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary bg-white" />
      </form>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {['Product','Category','Price','Stock','Status',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(products ?? []).map((p: any) => (
              <tr key={p.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
                      <Image src={productImageSrc(p.thumbnail)} alt={p.name} width={40} height={40} className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <p className="font-medium text-dark line-clamp-1">{p.name}</p>
                      {p.brand && <p className="text-xs text-muted">{p.brand}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.categories?.name ?? '—'}</td>
                <td className="px-4 py-3 font-semibold text-dark">{formatKES(p.price)}</td>
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
                  <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-primary hover:underline font-medium">Edit →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(products ?? []).length === 0 && (
          <p className="text-center py-12 text-muted text-sm">No products found.</p>
        )}
      </div>
    </div>
  )
}
