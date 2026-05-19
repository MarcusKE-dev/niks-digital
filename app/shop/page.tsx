import type { Metadata }       from 'next'
import { Suspense }             from 'react'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Navbar }               from '@/components/layout/Navbar'
import { Footer }               from '@/components/layout/Footer'
import { ProductCard }          from '@/components/shop/ProductCard'
import { ProductGridSkeleton }  from '@/components/ui/Skeleton'
import type { ProductSummary, Category } from '@/types'

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse TVs, fridges, laptops, phones, cookers and more. Kenyan prices, M-Pesa accepted, free Nairobi delivery.',
}

export const revalidate = 60

interface PageProps {
  searchParams: {
    category?: string
    search?:   string
    sort?:     string
    min?:      string
    max?:      string
    page?:     string
  }
}

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Best Rated' },
]

const BRANDS = ['Samsung','LG','Sony','HP','Hisense','Canon','TCL','Epson','Philips','Midea','Ramtons','Tecno','Infinix','JBL','GoPro','Russell Hobbs','Mika','Dell']

async function getData(params: PageProps['searchParams']) {
  const supabase = createSupabaseServer()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id,name,slug,icon,display_order')
    .order('display_order')

  // Build products query
  let query = supabase
    .from('products')
    .select(`id,name,slug,brand,price,old_price,thumbnail,badge,is_featured,stock_qty,rating,review_count,category_id,categories(slug)`)
    .eq('is_active', true)

  if (params.category) {
    const cat = (categories ?? []).find((c: any) => c.slug === params.category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  if (params.min) query = query.gte('price', Number(params.min))
  if (params.max) query = query.lte('price', Number(params.max))

  switch (params.sort) {
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'newest':     query = query.order('created_at', { ascending: false }); break
    case 'rating':     query = query.order('rating', { ascending: false }); break
    default:           query = query.order('review_count', { ascending: false })
  }

  const { data: products } = await query.limit(48)

  return {
    products:   (products ?? []) as ProductSummary[],
    categories: (categories ?? []) as Category[],
  }
}

export default async function ShopPage({ searchParams }: PageProps) {
  const { products, categories } = await getData(searchParams)
  const activeCategory = searchParams.category ?? ''
  const activeSort     = searchParams.sort ?? 'popular'

  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen">
        <div className="container-site py-8">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted mb-6 flex items-center gap-1.5">
            <a href="/" className="hover:text-primary">Home</a>
            <span>›</span>
            <span className="text-dark font-medium">
              {activeCategory
                ? categories.find(c => c.slug === activeCategory)?.name ?? 'Shop'
                : 'All Products'}
            </span>
          </nav>

          <div className="flex gap-6 items-start">

            {/* ── SIDEBAR ── */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-[88px]" aria-label="Product filters">
              <div className="bg-white border border-border rounded-lg overflow-hidden">

                {/* Categories */}
                <div className="p-4 border-b border-border">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Categories</h2>
                  <ul className="space-y-0.5">
                    <li>
                      <a href="/shop" className={`flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${!activeCategory ? 'bg-orange-50 text-primary font-semibold' : 'text-dark hover:bg-surface'}`}>
                        <span>All Products</span>
                        <span className="text-xs text-muted">{products.length}</span>
                      </a>
                    </li>
                    {categories.map(cat => {
                      const count = products.filter(p => (p as any).categories?.slug === cat.slug).length
                      return (
                        <li key={cat.slug}>
                          <a
                            href={`/shop?category=${cat.slug}`}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeCategory === cat.slug ? 'bg-orange-50 text-primary font-semibold border-l-2 border-primary' : 'text-dark hover:bg-surface'}`}
                          >
                            <span aria-hidden>{cat.icon}</span>
                            <span className="flex-1 leading-tight">{cat.name}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* Price range */}
                <div className="p-4 border-b border-border">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Price Range (KES)</h2>
                  <form method="get" className="flex gap-2 items-center">
                    {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
                    <input name="min" type="number" placeholder="Min" defaultValue={searchParams.min} className="w-full border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    <span className="text-muted text-xs">–</span>
                    <input name="max" type="number" placeholder="Max" defaultValue={searchParams.max} className="w-full border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    <button type="submit" className="flex-shrink-0 h-7 px-2 bg-primary text-white text-xs rounded font-medium">Go</button>
                  </form>
                </div>

                {/* Brands */}
                <div className="p-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Brands</h2>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                    {BRANDS.map(brand => {
                      const brandCount = products.filter(p => p.brand === brand).length
                      if (brandCount === 0) return null
                      return (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="accent-primary" />
                          <span className="text-xs text-dark group-hover:text-primary transition-colors">{brand}</span>
                          <span className="ml-auto text-2xs text-muted">{brandCount}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 min-w-0">

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <p className="text-sm text-muted">
                  <span className="font-semibold text-dark">{products.length}</span> products
                  {searchParams.search && <span> for &ldquo;<em className="text-dark">{searchParams.search}</em>&rdquo;</span>}
                </p>
                <form method="get">
                  {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
                  {searchParams.search && <input type="hidden" name="search" value={searchParams.search} />}
                  <select
                    name="sort"
                    defaultValue={activeSort}
                    
                    className="border border-border rounded-lg px-3 py-2 text-sm text-dark bg-white outline-none focus:border-primary"
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </form>
              </div>

              {/* Grid */}
              <Suspense fallback={<ProductGridSkeleton count={12} />}>
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                    {products.map((p, i) => (
                      <ProductCard key={p.id} product={p} priority={i < 8} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white border border-border rounded-lg">
                    <p className="text-3xl mb-3">🔍</p>
                    <p className="text-base font-semibold text-dark mb-1">No products found</p>
                    <p className="text-sm text-muted mb-5">Try different filters or browse all products</p>
                    <a href="/shop" className="inline-flex h-10 px-5 bg-primary text-white text-sm font-semibold rounded-full items-center hover:bg-primary-600 transition-colors">
                      View All Products
                    </a>
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
