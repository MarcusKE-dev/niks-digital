'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore }  from '@/store/cartStore'
import { Navbar }        from '@/components/layout/Navbar'
import { Footer }        from '@/components/layout/Footer'
import { formatKES, productImageSrc, qualifiesForFreeDelivery } from '@/lib/utils'
import { FREE_DELIVERY_THRESHOLD } from '@/types'

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, deliveryFee, total, totalItems } = useCartStore()
  const sub  = subtotal()
  const fee  = deliveryFee()
  const tot  = total()
  const free = qualifiesForFreeDelivery(sub)

  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen py-8">
        <div className="container-site">
          <h1 className="text-2xl font-extrabold text-dark mb-6">
            Shopping Cart {totalItems() > 0 && <span className="text-muted font-normal text-lg">({totalItems()} {totalItems() === 1 ? 'item' : 'items'})</span>}
          </h1>

          {items.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-border rounded-xl text-center py-20">
              <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-dark mb-1">Your cart is empty</p>
              <p className="text-sm text-muted mb-6">Browse our products and add items to your cart</p>
              <Link href="/shop" className="inline-flex h-11 px-6 bg-primary text-white font-semibold text-sm rounded-full items-center hover:bg-primary-600 transition-colors">
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* ── ITEMS ── */}
              <div className="lg:col-span-2 bg-white border border-border rounded-xl overflow-hidden">
                {items.map((item, i) => (
                  <div key={item.id} className={`flex gap-4 p-4 sm:p-5 ${i < items.length - 1 ? 'border-b border-border' : ''}`}>
                    {/* Image */}
                    <Link href={`/shop/${item.slug}`} className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface border border-border overflow-hidden block">
                      <Image src={productImageSrc(item.thumbnail)} alt={item.name} width={96} height={96} className="w-full h-full object-contain p-2" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.slug}`} className="block font-semibold text-sm text-dark hover:text-primary transition-colors line-clamp-2 mb-1">
                        {item.name}
                      </Link>
                      {item.brand && <p className="text-xs text-muted mb-2">{item.brand}</p>}
                      <p className="text-sm font-bold text-dark mb-3">{formatKES(item.price)}</p>

                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Qty */}
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-dark hover:bg-surface transition-colors" aria-label="Decrease">−</button>
                          <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-dark border-x border-border">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)} disabled={item.qty >= item.stock_qty} className="w-8 h-8 flex items-center justify-center text-dark hover:bg-surface disabled:opacity-40 transition-colors" aria-label="Increase">+</button>
                        </div>
                        {/* Remove */}
                        <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 text-xs text-danger hover:text-red-700 transition-colors" aria-label={`Remove ${item.name}`}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-bold text-dark text-sm">{formatKES(item.price * item.qty)}</p>
                      {item.qty > 1 && <p className="text-xs text-muted mt-0.5">{formatKES(item.price)} each</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── SUMMARY ── */}
              <div className="bg-white border border-border rounded-xl p-5 sticky top-24" aria-label="Order summary">
                <h2 className="font-extrabold text-dark text-base mb-5">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal ({totalItems()} items)</span>
                    <span className="font-semibold text-dark">{formatKES(sub)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery fee</span>
                    <span className={free ? 'text-success font-semibold' : 'font-semibold text-dark'}>
                      {free ? 'FREE' : formatKES(fee)}
                    </span>
                  </div>
                  {!free && (
                    <p className="text-xs text-muted bg-surface rounded-lg p-2.5 leading-relaxed">
                      Add <span className="font-bold text-dark">{formatKES(FREE_DELIVERY_THRESHOLD - sub)}</span> more to qualify for free delivery
                    </p>
                  )}
                </div>

                <hr className="border-border mb-4" />
                <div className="flex justify-between font-extrabold text-dark mb-5">
                  <span>Total</span>
                  <span className="text-lg">{formatKES(tot)}</span>
                </div>

                <Link href="/checkout" className="block w-full h-12 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors mb-3 shadow-btn-primary text-center">
                  Proceed to Checkout
                </Link>
                <Link href="/shop" className="block w-full h-10 text-center text-sm font-medium text-dark hover:text-primary transition-colors flex items-center justify-center">
                  ← Continue Shopping
                </Link>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-center gap-3 text-xs text-muted">
                  <span>🔒 Secure Checkout</span>
                  <span>·</span>
                  <span>📱 M-Pesa</span>
                  <span>·</span>
                  <span>💳 Card</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
