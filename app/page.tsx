import type { Metadata }        from 'next'
import Link                     from 'next/link'
import { Suspense }             from 'react'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Navbar }               from '@/components/layout/Navbar'
import { Footer }               from '@/components/layout/Footer'
import { ProductGridSkeleton }  from '@/components/ui/Skeleton'
import { FeaturedProductTabs }  from '@/components/shop/FeaturedProductTabs'
import type { ProductSummary }  from '@/types'
import { HeroBanner }           from '@/components/shop/HeroBanner'

export const metadata: Metadata = {
  title: 'Niks Digital Connections – Electronics Shop | Kikuyu Town',
  description: 'Buy phones, TVs, laptops, speakers and electronics in Kikuyu Town. M-Pesa accepted.',
}

export const revalidate = 0

const FEATURES = [
  { icon: '🚚', title: 'Free Kikuyu Delivery',   sub: 'On orders above KES 10,000' },
  { icon: '✅', title: '100% Genuine Products',  sub: 'Authorized dealer stock only' },
  { icon: '📱', title: 'M-Pesa & Card Payments', sub: 'Fast and secure checkout' },
  { icon: '🔧', title: 'After-Sales Support',     sub: 'Installation & warranty help' },
]

const TESTIMONIALS = [
  { name: 'Mary W.',      location: 'Kikuyu Town', stars: 5, quote: 'Got my phone and accessories same day. Great service and genuine products!' },
  { name: 'James Otieno', location: 'Kawangware',  stars: 5, quote: 'Best prices around Kikuyu. M-Pesa payment was seamless. Highly recommend.' },
  { name: 'Fatuma A.',    location: 'Limuru',       stars: 5, quote: 'Bought a laptop for my son. Very helpful team and good prices.' },
]

async function getProducts() {
  const supabase = createSupabaseServer()
  const { data } = await supabase
    .from('products')
    .select('id,name,slug,brand,price,old_price,thumbnail,badge,is_featured,stock_qty,rating,review_count,category_id')
    .eq('is_active', true)
    .order('review_count', { ascending: false })
    .limit(40)
  return (data ?? []) as ProductSummary[]
}

async function getSettings() {
  const supabase = createSupabaseServer()
  const { data } = await supabase.from('site_settings').select('key,value')
  const map: Record<string, string> = {}
  ;(data ?? []).forEach((row: any) => { map[row.key] = row.value })
  return map
}

export default async function HomePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()])

  const featured    = products.filter(p => p.is_featured).slice(0, 10)
  const bestSellers = products.slice(0, 20)
  const newArrivals = products.filter(p => p.badge === 'new').slice(0, 10)
  const onSale      = products.filter(p => p.badge === 'sale').slice(0, 10)

  // Extract banner images – no fallback, if empty, no hero
  let bannerImages: string[] = []
  if (settings.hero_images) {
    try {
      const parsed = JSON.parse(settings.hero_images)
      if (Array.isArray(parsed)) bannerImages = parsed.filter(img => img && img.trim() !== '')
    } catch {}
  }
  if (bannerImages.length === 0 && settings.hero_image) {
    bannerImages = [settings.hero_image]
  }

  const hasBanner = bannerImages.length > 0
  const hasText   = !!settings.hero_title || !!settings.hero_subtitle

  const CATEGORIES = [
    { slug: 'phones',      label: 'Phones & Accessories', icon: '📱', count: '50+' },
    { slug: 'computers',   label: 'Computer Accessories',  icon: '💻', count: '30+' },
    { slug: 'tvs',         label: 'Televisions',           icon: '📺', count: '20+' },
    { slug: 'audio',       label: 'Audio & Speakers',      icon: '🎧', count: '15+' },
    { slug: 'kitchen',     label: 'Kitchen Appliances',    icon: '🍳', count: '25+' },
    { slug: 'electronics', label: 'Basic Electronics',     icon: '🔌', count: '40+' },
    { slug: 'wearables',   label: 'Smart Watches',         icon: '⌚', count: '10+' },
  ].map(cat => ({
    ...cat,
    image: settings[`category_image_${cat.slug}`] ?? `/categories/${cat.slug}.jpg`,
  }))

  return (
    <div>
      <Navbar />
      <main>

        {/* Hero section – only rendered if there is at least one banner image */}
        {hasBanner && (
          <section className="bg-white py-8 lg:py-12">
            <div className="container-site">
              {!hasText ? (
                <div className="relative rounded-xl overflow-hidden border border-border bg-surface w-full" style={{height: '420px'}}>
                  <HeroBanner images={bannerImages} interval={3000} />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div>
                    {settings.hero_title && (
                      <h1 className="text-4xl lg:text-5xl font-extrabold text-dark leading-tight mb-4">
                        {settings.hero_title}
                      </h1>
                    )}
                    {settings.hero_subtitle && (
                      <p className="text-base text-muted leading-relaxed mb-8 max-w-md">
                        {settings.hero_subtitle}
                      </p>
                    )}
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-border bg-surface aspect-[4/3]">
                    <HeroBanner images={bannerImages} interval={3000} />
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex gap-3">
                  <Link href="/shop"
                    className="h-11 px-6 bg-primary text-white font-semibold rounded-full text-sm flex items-center hover:bg-primary-600 transition-colors">
                    Shop Now
                  </Link>
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                    target="_blank" rel="noopener noreferrer"
                    className="h-11 px-6 bg-white border border-border text-dark font-semibold rounded-full text-sm flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
                    💬 WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Shop by Category */}
        <section className="bg-white py-8 lg:py-12">
          <div className="container-site">
            <div className="mb-8">
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle mt-1">Browse our full range</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {CATEGORIES.map(cat => (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center border border-border rounded-xl bg-white hover:border-primary hover:shadow-card transition-all duration-normal overflow-hidden">
                  <div className="w-full h-24 bg-surface overflow-hidden">
                    <img src={cat.image} alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow" />
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-bold text-dark leading-snug block">{cat.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-surface py-8 lg:py-12">
          <div className="container-site">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
              <div>
                <h2 className="section-title">Featured Products</h2>
                <p className="section-subtitle mt-1">Handpicked for every budget</p>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-primary hover:underline">
                View all products
              </Link>
            </div>
            <Suspense fallback={<ProductGridSkeleton count={5} />}>
              <FeaturedProductTabs
                featured={featured}
                bestSellers={bestSellers}
                newArrivals={newArrivals}
                onSale={onSale}
              />
            </Suspense>
          </div>
        </section>

        {/* Promo Strip */}
        <section className="bg-primary py-5">
          <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white font-bold text-base sm:text-lg text-center sm:text-left">
              Free Delivery on All Orders Above KES 10,000
            </p>
            <Link href="/shop"
              className="flex-shrink-0 inline-flex items-center h-10 px-5 bg-white text-primary font-bold text-sm rounded-full hover:bg-red-50 transition-colors">
              Shop Now
            </Link>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-surface border-y border-border py-10">
          <div className="container-site">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-dark">{f.title}</p>
                    <p className="text-xs text-muted mt-0.5 leading-snug">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white py-8 lg:py-12">
          <div className="container-site">
            <div className="text-center mb-10">
              <h2 className="section-title">What Our Customers Say</h2>
              <p className="section-subtitle mx-auto mt-1">Trusted across Kikuyu and Nairobi</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map(t => (
                <blockquote key={t.name} className="bg-white border border-border rounded-lg p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <span key={i} className="text-primary text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted italic leading-relaxed mb-4 line-clamp-3">
                    {t.quote}
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
    </div>
  )
}
