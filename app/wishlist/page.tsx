'use client'
import Link from 'next/link'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore }     from '@/store/cartStore'
import { Navbar }           from '@/components/layout/Navbar'
import { Footer }           from '@/components/layout/Footer'
import { formatKES, productImageSrc } from '@/lib/utils'
import { useToast }         from '@/components/ui/Toaster'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addToCart = useCartStore(s => s.addItem)
  const toast = useToast()

  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen py-8">
        <div className="container-site max-w-3xl">
          <h1 className="text-2xl font-extrabold text-dark mb-6">
            My Wishlist {items.length > 0 && <span className="text-muted font-normal text-lg">({items.length})</span>}
          </h1>

          {items.length === 0 ? (
            <div className="bg-white border border-border rounded-xl text-center py-20">
              <p className="text-3xl mb-3">♡</p>
              <p className="font-bold text-dark mb-1">Your wishlist is empty</p>
              <p className="text-sm text-muted mb-6">Save products you like and come back to them later</p>
              <Link href="/shop" className="inline-flex h-11 px-6 bg-primary text-white font-semibold text-sm rounded-full items-center">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 bg-white border border-border rounded-xl p-4 items-center">
                  <Link href={`/shop/${item.slug}`}>
                    <img src={productImageSrc(item.thumbnail)} alt={item.name}
                      className="w-16 h-16 object-contain bg-surface rounded-lg border border-border p-1" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${item.slug}`} className="font-semibold text-sm text-dark hover:text-primary line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-primary font-bold mt-1">{formatKES(item.price)}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => { addToCart(item); toast.success('Added to cart!') }}
                      className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-600 transition-colors">
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="h-9 px-4 text-xs font-medium text-danger hover:bg-red-50 rounded-full transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}