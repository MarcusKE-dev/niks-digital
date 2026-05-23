'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Filter, ChevronDown, Check } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase'
import { ProductCard } from '@/components/shop/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { formatKES } from '@/lib/utils'
import type { ProductSummary, Category } from '@/types'

// ============================================================
// BRAND LIST (capitalised, used for display and case‑insensitive matching)
// ============================================================
const BRANDS_LIST = [
  'Samsung', 'Apple', 'Tecno', 'Infinix', 'Nokia', 'Huawei', 'Itel', 'Vitron',
  'LG', 'Sony', 'Hisense', 'TCL', 'Philips', 'Panasonic', 'Midea', 'Ramtons',
  'Russell Hobbs', 'Mika', 'Nesco', 'Beko', 'HP', 'Dell', 'Lenovo', 'JBL',
  'Bose', 'Canon', 'Epson', 'GoPro', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'
]

// Create a map for case‑insensitive lookup: lowercase -> capitalised
const brandMap = new Map<string, string>()
BRANDS_LIST.forEach(b => brandMap.set(b.toLowerCase(), b))

// Helper: get the capitalised brand name from any case variant
function normalizeBrand(brand: string | null): string | null {
  if (!brand) return null
  const lower = brand.toLowerCase()
  return brandMap.get(lower) || null  // if not in list, return null (won't be shown)
}

// ============================================================
// SORT DROPDOWN (styled)
// ============================================================
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
]

function SortDropdown({ currentSort, onSortChange }: { currentSort: string; onSortChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Sort by'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg text-sm text-dark hover:border-primary"
      >
        <span>{currentLabel}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg z-20">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSortChange(opt.value); setIsOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-surface flex items-center justify-between ${
                currentSort === opt.value ? 'text-primary font-semibold bg-orange-50' : 'text-dark'
              }`}
            >
              {opt.label}
              {currentSort === opt.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// BRANDS FILTER (collapsible, closed by default)
// ============================================================
function BrandsFilter({
  brandsList,
  selectedBrands,
  onBrandToggle,
  productCounts
}: {
  brandsList: string[]
  selectedBrands: string[]
  onBrandToggle: (brand: string) => void
  productCounts: Record<string, number>
}) {
  const [isOpen, setIsOpen] = useState(false) // ← closed initially

  // Only show brands that have at least one product (using capitalised names)
  const visibleBrands = brandsList.filter(brand => (productCounts[brand] || 0) > 0)

  if (visibleBrands.length === 0) {
    return (
      <div className="border-b border-border">
        <div className="p-4">
          <span className="font-bold text-dark text-sm">Brands</span>
          <p className="text-xs text-muted mt-2">No brand data available yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-bold text-dark text-sm"
      >
        <span>Brands</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 space-y-1.5 max-h-48 overflow-y-auto">
          {visibleBrands.map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-primary"
                checked={selectedBrands.includes(brand)}
                onChange={() => onBrandToggle(brand)}
              />
              <span className="text-xs text-dark">{brand}</span>
              <span className="ml-auto text-2xs text-muted">{productCounts[brand]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MAIN SHOP PAGE
// ============================================================
export default function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Active filters (from URL)
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')
  const [activeMinPrice, setActiveMinPrice] = useState(searchParams.get('min') || '')
  const [activeMaxPrice, setActiveMaxPrice] = useState(searchParams.get('max') || '')
  const [activeBrands, setActiveBrands] = useState<string[]>(() => {
    const brands = searchParams.get('brands')
    return brands ? brands.split(',') : []
  })
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular')

  // Temporary filter values (for the UI)
  const [tempCategory, setTempCategory] = useState(activeCategory)
  const [tempMinPrice, setTempMinPrice] = useState(activeMinPrice)
  const [tempMaxPrice, setTempMaxPrice] = useState(activeMaxPrice)
  const [tempBrands, setTempBrands] = useState<string[]>(activeBrands)

  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({})

  // Toggle brand in temporary selection
  const toggleTempBrand = (brand: string) => {
    setTempBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])
  }

  // Apply temporary filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams()
    if (tempCategory) params.set('category', tempCategory)
    if (tempMinPrice) params.set('min', tempMinPrice)
    if (tempMaxPrice) params.set('max', tempMaxPrice)
    if (tempBrands.length) params.set('brands', tempBrands.join(','))
    if (sort !== 'popular') params.set('sort', sort)
    router.push(`/shop?${params.toString()}`)
    setActiveCategory(tempCategory)
    setActiveMinPrice(tempMinPrice)
    setActiveMaxPrice(tempMaxPrice)
    setActiveBrands(tempBrands)
    setMobileFilterOpen(false)
  }

  // Clear all temporary filters
  const clearFilters = () => {
    setTempCategory('')
    setTempMinPrice('')
    setTempMaxPrice('')
    setTempBrands([])
  }

  // Sort change (immediate)
  const handleSortChange = (value: string) => {
    setSort(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value !== 'popular') params.set('sort', value)
    else params.delete('sort')
    router.push(`/shop?${params.toString()}`)
  }

  // Fetch products when active filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      // Get categories
      const { data: catData } = await supabaseBrowser
        .from('categories')
        .select('id,name,slug,icon,display_order')
        .order('display_order')
      const mappedCats = (catData ?? []).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: null,
        icon: c.icon,
        image_url: null,
        display_order: c.display_order,
        created_at: '',
      }))
      setCategories(mappedCats)

      // Build query
      let query = supabaseBrowser
        .from('products')
        .select(`id,name,slug,brand,price,old_price,thumbnail,badge,is_featured,stock_qty,rating,review_count,category_id,categories(slug)`)
        .eq('is_active', true)

      if (activeCategory) {
        const selectedCat = mappedCats.find(c => c.slug === activeCategory)
        if (selectedCat) query = query.eq('category_id', selectedCat.id)
      }
      if (activeMinPrice) query = query.gte('price', Number(activeMinPrice))
      if (activeMaxPrice) query = query.lte('price', Number(activeMaxPrice))
      if (activeBrands.length) query = query.in('brand', activeBrands)

      switch (sort) {
        case 'price_asc': query = query.order('price', { ascending: true }); break
        case 'price_desc': query = query.order('price', { ascending: false }); break
        case 'newest': query = query.order('created_at', { ascending: false }); break
        case 'rating': query = query.order('rating', { ascending: false }); break
        default: query = query.order('review_count', { ascending: false })
      }

      const { data: productsData } = await query.limit(48)
      setProducts(productsData ?? [])

      // Count brands case‑insensitively, using capitalised names from BRANDS_LIST
      const counts: Record<string, number> = {}
      productsData?.forEach(p => {
        const normalized = normalizeBrand(p.brand)
        if (normalized) {
          counts[normalized] = (counts[normalized] || 0) + 1
        }
      })
      setBrandCounts(counts)
      setLoading(false)
    }
    fetchData()
  }, [activeCategory, activeMinPrice, activeMaxPrice, activeBrands, sort])

  // Sync temp state when active state changes (after apply)
  useEffect(() => {
    setTempCategory(activeCategory)
    setTempMinPrice(activeMinPrice)
    setTempMaxPrice(activeMaxPrice)
    setTempBrands(activeBrands)
  }, [activeCategory, activeMinPrice, activeMaxPrice, activeBrands])

  return (
    <>
      <div className="bg-surface min-h-screen">
        <div className="container-site py-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
            <a href="/" className="hover:text-primary">Home</a>
            <span>›</span>
            <span className="text-dark font-medium">
              {activeCategory ? categories.find(c => c.slug === activeCategory)?.name ?? 'Shop' : 'All Products'}
            </span>
          </nav>

          <div className="flex gap-6 items-start">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-[88px]">
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                {/* Categories */}
                <div className="p-4 border-b border-border">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Categories</h2>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="category" className="accent-primary" checked={tempCategory === ''} onChange={() => setTempCategory('')} />
                      <span className="text-sm text-dark">All Products</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="category" className="accent-primary" checked={tempCategory === cat.slug} onChange={() => setTempCategory(cat.slug)} />
                        <span className="flex items-center gap-2 text-sm text-dark"><span>{cat.icon}</span><span>{cat.name}</span></span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="p-4 border-b border-border">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Price Range (KES)</h2>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={tempMinPrice} onChange={(e) => setTempMinPrice(e.target.value)} className="w-full border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    <span className="text-muted text-xs">–</span>
                    <input type="number" placeholder="Max" value={tempMaxPrice} onChange={(e) => setTempMaxPrice(e.target.value)} className="w-full border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-primary" />
                  </div>
                </div>

                {/* Brands Filter (closed by default) */}
                <BrandsFilter
                  brandsList={BRANDS_LIST}
                  selectedBrands={tempBrands}
                  onBrandToggle={toggleTempBrand}
                  productCounts={brandCounts}
                />

                {/* Action Buttons */}
                <div className="p-4 flex flex-col gap-2">
                  <button onClick={applyFilters} className="w-full h-9 bg-primary text-white font-semibold text-sm rounded-full hover:bg-primary-600">Apply Filters</button>
                  <button onClick={clearFilters} className="w-full h-9 bg-white border border-border text-dark font-semibold text-sm rounded-full hover:bg-surface">Clear All</button>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Button + Drawer */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <p className="text-sm text-muted">
                  <span className="font-semibold text-dark">{products.length}</span> products
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden p-2 rounded-full bg-white border border-border text-dark hover:border-primary"
                  >
                    <Filter size={18} />
                  </button>
                  <SortDropdown currentSort={sort} onSortChange={handleSortChange} />
                </div>
              </div>

              {loading ? (
                <ProductGridSkeleton count={12} />
              ) : products.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 8} />)}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-border rounded-lg">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="text-base font-semibold text-dark mb-1">No products found</p>
                  <a href="/shop" className="inline-flex h-10 px-5 bg-primary text-white text-sm font-semibold rounded-full">View All Products</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-dark text-lg">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="w-8 h-8 flex items-center justify-center text-muted hover:text-dark text-xl">✕</button>
            </div>

            {/* Categories (radio) */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Categories</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="mobile-cat" className="accent-primary" checked={tempCategory === ''} onChange={() => setTempCategory('')} />
                  <span className="text-sm text-dark">All Products</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.slug} className="flex items-center gap-2">
                    <input type="radio" name="mobile-cat" className="accent-primary" checked={tempCategory === cat.slug} onChange={() => setTempCategory(cat.slug)} />
                    <span className="flex items-center gap-2 text-sm text-dark"><span>{cat.icon}</span><span>{cat.name}</span></span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Price Range (KES)</h2>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={tempMinPrice} onChange={(e) => setTempMinPrice(e.target.value)} className="w-full border border-border rounded px-2 py-1.5 text-xs" />
                <span className="text-muted text-xs">–</span>
                <input type="number" placeholder="Max" value={tempMaxPrice} onChange={(e) => setTempMaxPrice(e.target.value)} className="w-full border border-border rounded px-2 py-1.5 text-xs" />
              </div>
            </div>

            {/* Brands Filter (same component, closed by default) */}
            <BrandsFilter
              brandsList={BRANDS_LIST}
              selectedBrands={tempBrands}
              onBrandToggle={toggleTempBrand}
              productCounts={brandCounts}
            />

            <div className="flex gap-3 mt-6">
              <button onClick={applyFilters} className="flex-1 h-10 bg-primary text-white font-semibold rounded-full">Apply Filters</button>
              <button onClick={clearFilters} className="flex-1 h-10 bg-white border border-border text-dark font-semibold rounded-full">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}