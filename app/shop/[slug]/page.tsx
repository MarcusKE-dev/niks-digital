import { notFound }          from 'next/navigation'
import type { Metadata }      from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Navbar }               from '@/components/layout/Navbar'
import { Footer }               from '@/components/layout/Footer'
import { ProductDetailClient }  from '@/components/shop/ProductDetailClient'
import { ProductCard }          from '@/components/shop/ProductCard'
import type { Product, ProductSummary } from '@/types'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createSupabaseServer()
  const { data } = await supabase.from('products').select('name,description,thumbnail').eq('slug', params.slug).single()
  if (!data) return { title: 'Product Not Found' }
  return {
    title: data.name,
    description: data.description?.slice(0, 155) ?? `Buy ${data.name} at Niks Digital Connection, Nairobi.`,
    openGraph: { images: data.thumbnail ? [data.thumbnail] : [] },
  }
}

export const revalidate = 60

async function getProduct(slug: string) {
  const supabase = createSupabaseServer()
  const { data } = await supabase
    .from('products')
    .select('*,categories(id,name,slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Product | null
}

async function getSimilar(categoryId: string, productId: string) {
  const supabase = createSupabaseServer()
  const { data } = await supabase
    .from('products')
    .select('id,name,slug,brand,price,old_price,thumbnail,badge,is_featured,stock_qty,rating,review_count,category_id')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(5)
  return (data ?? []) as ProductSummary[]
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const similar = await getSimilar(product.category_id, product.id)

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="container-site py-8">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted mb-6 flex items-center gap-1.5 flex-wrap">
            <a href="/" className="hover:text-primary">Home</a>
            <span>›</span>
            <a href="/shop" className="hover:text-primary">Shop</a>
            <span>›</span>
            {(product as any).categories && (
              <>
                <a href={`/shop?category=${(product as any).categories.slug}`} className="hover:text-primary">
                  {(product as any).categories.name}
                </a>
                <span>›</span>
              </>
            )}
            <span className="text-dark font-medium line-clamp-1">{product.name}</span>
          </nav>

          {/* Product detail (client component handles interactivity) */}
          <ProductDetailClient product={product} />

          {/* Similar products */}
          {similar.length > 0 && (
            <section className="mt-16 pt-10 border-t border-border" aria-labelledby="similar-heading">
              <h2 className="text-xl font-bold text-dark mb-6" id="similar-heading">Similar Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {similar.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
