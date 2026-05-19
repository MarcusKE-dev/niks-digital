import type { Metadata }      from 'next'
import Image                   from 'next/image'
import Link                    from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Navbar }               from '@/components/layout/Navbar'
import { Footer }               from '@/components/layout/Footer'
import { ProductCard }          from '@/components/shop/ProductCard'
import { ProductGridSkeleton }  from '@/components/ui/Skeleton'
import { formatKES }            from '@/lib/utils'
import type { ProductSummary, Category } from '@/types'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Niks Digital Connection – Electronics & Home Appliances | Nairobi',
  description: 'Shop TVs, fridges, laptops, cookers, phones and more in Nairobi. Genuine products · Kenyan prices · Free delivery · M-Pesa accepted.',
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

const BRANDS   = ['Samsung','LG','Sony','HP','Hisense','Canon','TCL','Epson']
const FEATURES = [
  { icon: '🚚', title: 'Free Nairobi Delivery',   sub: 'On orders above KES 10,000' },
  { icon: '✅', title: '100% Genuine Products',   sub: 'Authorized dealer stock only' },
  { icon: '📱', title: 'M-Pesa & Card Payments',  sub: 'Fast and secure checkout' },
  { icon: '🔧', title: 'After-Sales Support',      sub: 'Installation & warranty help' },
]
const TESTIMONIALS = [
  { name: 'Mary W.',      location: 'Kasarani',         stars: 5, quote: 'Ordered a Samsung fridge on Saturday, delivered Sunday morning. The team helped me set it up — excellent service!' },
  { name: 'James Otieno', location: 'Westlands',        stars: 5, quote: 'Best prices in Nairobi for genuine electronics. M-Pesa payment was seamless. Highly recommend Niks Digital.' },
  { name: 'Fatuma A.',    location: 'South C, Nairobi', stars: 5, quote: 'Bought a laptop for my son\'s studies. The team was very helpful in recommending the right spec for his budget.' },
]
const CATEGORIES = [
  { slug:'televisions',   label:'Televisions',       icon:'📺', count:'20+' },
  { slug:'refrigerators', label:'Refrigerators',     icon:'🧊', count:'12+' },
  { slug:'cookers',       label:'Cookers & Ovens',   icon:'🔥', count:'15+' },
  { slug:'laptops',       label:'Laptops & PCs',     icon:'💻', count:'14+' },
  { slug:'phones',        label:'Mobile Phones',     icon:'📱', count:'22+' },
  { slug:'audio',         label:'Audio & Speakers',  icon:'🔊', count:'11+' },
  { slug:'cameras',       label:'Cameras',           icon:'📷', count:'7+' },
  { slug:'kitchen',       label:'Kitchen Appliances',icon:'🍳', count:'18+' },
]

async function getProducts() {
  const supabase = createSupabaseServer()
  const { data } = await supabase
    .from('products')
    .select(`id,name,slug,brand,price,old_price,thumbnail,badge,is_featured,stock_qty,rating,review_count,category_id`)
    .eq('is_active', true)
    .order('review_count', { ascending: false })
    .limit(20)
  return (data ?? []) as ProductSummary[]
}

export default async function HomePage() {
  const products    = await getProducts()
  const featured    = products.filter(p => p.is_featured).slice(0, 5)
  const bestSellers = products.slice(0, 10)
  const newArrivals = products.filter(p => p.badge === 'new').slice(0, 5)
  const onSale      = products.filter(p => p.badge === 'sale').slice(0, 5)

  return (
    <>
      <Navbar />
      <main>

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section className="bg-white section-padding" aria-label="Welcome to Niks Digital Connection">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Text */}
              <div>
                <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 mb-6">
                  <span className="text-xs font-semibold text-dark">🇰🇪 Nairobi's Trusted Electronics Store</span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-extrabold text-dark leading-tight mb-4 text-balance">
                  Kenya's Best Electronics.<br />
                  At Prices That{' '}
                  <span className="text-primary">Make Sense.</span>
                </h1>

                <p className="text-base text-muted leading-relaxed mb-8 max-w-md">
                  From 4K Smart TVs and energy-saving refrigerators to powerful laptops and sleek smartphones — all under one roof in Westlands, Nairobi.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Link href="/shop" className="inline-flex items-center gap-2 h-12 px-6 bg-primary text-white font-semibold rounded-full hover:bg-primary-600 transition-colors shadow-btn-primary text-sm">
                    Shop Now →
                  </Link>
                  <Link href="/shop" className="inline-flex items-center gap-2 h-12 px-6 bg-white border border-border text-dark font-semibold rounded-full hover:border-primary hover:text-primary transition-colors text-sm">
                    View All Categories
                  </Link>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {['Free Nairobi Delivery', 'M-Pesa Accepted', '12-Month Warranty'].map(t => (
                    <span key={t} className="text-xs text-muted flex items-center gap-1.5">
                      <span className="text-success font-bold">✓</span> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="relative rounded-xl overflow-hidden border border-border bg-surface aspect-[4/3]">
                <Image
                  src="https://picsum.photos/seed/niks-hero-electronics/800/600"
                  alt="Electronics and home appliances at Niks Digital Connection, Nairobi"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Brand logos */}
            <div className="mt-14 pt-8 border-t border-border">
              <p className="text-xs text-muted uppercase tracking-widest text-center mb-5 font-semibold">Authorised Dealer For</p>
              <div className="flex flex-wrap justify-center gap-8 items-center">
                {BRANDS.map(b => (
                  <span key={b} className="text-base font-extrabold text-gray-300 tracking-tight select-none">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            WHY CHOOSE US
        ══════════════════════════════════════════════════ */}
        <section className="bg-surface border-y border-border py-10" aria-label="Why shop at Niks Digital">
          <div className="container-site">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden>{f.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-dark">{f.title}</p>
                    <p className="text-xs text-muted mt-0.5 leading-snug">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CATEGORY GRID
        ══════════════════════════════════════════════════ */}
        <section className="bg-white section-padding" aria-labelledby="categories-heading">
          <div className="container-site">
            <div className="mb-8">
              <h2 className="section-title" id="categories-heading">Shop by Category</h2>
              <p className="section-subtitle mt-1">Browse our full range across 8 product categories</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center p-4 border border-border rounded-lg bg-white hover:border-l-4 hover:border-l-primary hover:translate-x-1 hover:shadow-card transition-all duration-normal focus-ring"
                >
                  <span className="text-3xl mb-2" aria-hidden>{cat.icon}</span>
                  <span className="text-xs font-bold text-dark leading-snug">{cat.label}</span>
                  <span className="text-2xs text-muted mt-0.5">{cat.count} products</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FEATURED PRODUCTS (tabbed)
        ══════════════════════════════════════════════════ */}
        <section className="bg-surface section-padding" aria-labelledby="products-heading">
          <div className="container-site">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
              <div>
                <h2 className="section-title" id="products-heading">Featured Products</h2>
                <p className="section-subtitle mt-1">Handpicked products for every Kenyan home</p>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
                View all products →
              </Link>
            </div>

            <Suspense fallback={<ProductGridSkeleton count={5} />}>
              <ProductTabs featured={featured} bestSellers={bestSellers} newArrivals={newArrivals} onSale={onSale} />
            </Suspense>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PROMO STRIP
        ══════════════════════════════════════════════════ */}
        <section className="bg-primary py-5" aria-label="Promotional offer">
          <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white font-bold text-base sm:text-lg text-center sm:text-left">
              🚚 Free Delivery on All Orders Above KES 10,000 — Nairobi Wide
            </p>
            <Link
              href="/shop"
              className="flex-shrink-0 inline-flex items-center h-10 px-5 bg-white text-primary font-bold text-sm rounded-full hover:bg-orange-50 transition-colors"
            >
              Shop Now →
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════════════ */}
        <section className="bg-white section-padding" aria-labelledby="testimonials-heading">
          <div className="container-site">
            <div className="text-center mb-10">
              <h2 className="section-title" id="testimonials-heading">What Our Customers Say</h2>
              <p className="section-subtitle mx-auto mt-1">5,000+ happy customers across Nairobi</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map(t => (
                <blockquote key={t.name} className="bg-white border border-border rounded-lg p-6">
                  <div className="flex gap-0.5 mb-3" aria-label={`${t.stars} stars`}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <span key={i} className="text-primary text-sm" aria-hidden>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted italic leading-relaxed mb-4 line-clamp-3">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <hr className="border-border mb-4" />
                  <footer>
                    <cite className="not-italic">
                      <span className="text-sm font-bold text-dark block">{t.name}</span>
                      <span className="text-xs text-muted">{t.location}</span>
                    </cite>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

// ── Client component for tabs ─────────────────────────────────
// Separated so only the tabs are a client component, not the whole page.
import { FeaturedProductTabs } from '@/components/shop/FeaturedProductTabs'
const ProductTabs = FeaturedProductTabs
