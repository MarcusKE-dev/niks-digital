'use client'

import { useState }        from 'react'
import Image               from 'next/image'
import Link                from 'next/link'
import { ShoppingCart, MessageCircle, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatKES, calculateSavings, normalizeImages, productImageSrc } from '@/lib/utils'
import { useCartStore }    from '@/store/cartStore'
import { useToast }        from '@/components/ui/Toaster'
import { StockBadge }      from '@/components/ui/Badge'
import { StarRating }      from '@/components/shop/StarRating'
import type { Product }    from '@/types'

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty]                 = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const toast   = useToast()

  const images   = normalizeImages(product.images.length ? product.images : [product.thumbnail ?? ''], 4)
  const savings  = calculateSavings(product.price, product.old_price)
  const inStock  = product.stock_qty > 0
  const maxQty   = Math.min(product.stock_qty, 10)

  function handleAddToCart() {
    if (!inStock) return
    addItem(product, qty)
    toast.success(`${product.name.split(' ').slice(0,3).join(' ')} added to cart!`)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.info('Link copied to clipboard!')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

      {/* ── GALLERY ── */}
      <div>
        {/* Main image */}
        <div className="relative bg-surface border border-border rounded-xl overflow-hidden mb-3" style={{ height: 420 }}>
          <Image
            key={selectedImg}
            src={productImageSrc(images[selectedImg])}
            alt={`${product.name} — image ${selectedImg + 1}`}
            fill
            className="object-contain p-6"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Prev / Next */}
          {images.filter(Boolean).length > 1 && (
            <>
              <button onClick={() => setSelectedImg(i => Math.max(0, i - 1))} disabled={selectedImg === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-card flex items-center justify-center text-dark disabled:opacity-30 hover:bg-surface transition-colors"
                aria-label="Previous image">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setSelectedImg(i => Math.min(images.length - 1, i + 1))} disabled={selectedImg === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-card flex items-center justify-center text-dark disabled:opacity-30 hover:bg-surface transition-colors"
                aria-label="Next image">
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
        {/* Thumbnails */}
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setSelectedImg(i)} aria-label={`View image ${i + 1}`}
              className={cn('w-16 h-16 rounded-lg border-2 overflow-hidden bg-surface flex-shrink-0 transition-all',
                selectedImg === i ? 'border-primary' : 'border-border hover:border-gray-300')}>
              <Image src={productImageSrc(img)} alt="" width={64} height={64} className="object-contain p-1 w-full h-full" />
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCT INFO ── */}
      <div>
        {product.brand && <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">{product.brand}</p>}
        <h1 className="text-2xl lg:text-3xl font-extrabold text-dark leading-tight mb-3">{product.name}</h1>

        <StarRating rating={product.rating} reviewCount={product.review_count} size="md" className="mb-4" />

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-extrabold text-dark">{formatKES(product.price)}</span>
          {product.old_price && (
            <span className="text-base text-muted line-through">{formatKES(product.old_price)}</span>
          )}
        </div>
        {savings && (
          <p className="text-sm font-semibold text-success mb-3">
            You save {formatKES(savings.amount)} ({savings.percent}% off)
          </p>
        )}

        <StockBadge stockQty={product.stock_qty} className="mb-5" />

        <hr className="border-border mb-5" />

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted leading-relaxed mb-5">{product.description}</p>
        )}

        {/* Features */}
        {product.features.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Key Features</p>
            <ul className="space-y-2">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-dark">
                  <span className="w-4 h-4 rounded-full bg-success/10 text-success flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delivery info */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 text-sm">
          <p className="font-semibold text-dark mb-1">🚚 Delivery Information</p>
          <p className="text-muted text-xs leading-relaxed">Free delivery in Nairobi on this item for orders above KES 10,000. Estimated delivery: 1–2 business days after payment confirmation.</p>
        </div>

        {/* Qty + actions */}
        {inStock && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-dark hover:bg-surface transition-colors text-lg font-medium" aria-label="Decrease quantity">−</button>
              <span className="w-10 h-11 flex items-center justify-center text-sm font-bold text-dark border-x border-border">{qty}</span>
              <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="w-10 h-11 flex items-center justify-center text-dark hover:bg-surface transition-colors text-lg font-medium" aria-label="Increase quantity">+</button>
            </div>
            <span className="text-xs text-muted">{product.stock_qty} in stock</span>
          </div>
        )}

        <button onClick={handleAddToCart} disabled={!inStock}
          className="w-full h-12 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3 shadow-btn-primary">
          <ShoppingCart size={18} aria-hidden />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>

        <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '254700000001'}?text=Hi! I'm interested in: ${product.name}. Can I get more details?`}
          target="_blank" rel="noopener noreferrer"
          className="w-full h-12 bg-dark text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-dark-400 transition-colors mb-4">
          <MessageCircle size={18} aria-hidden />
          Buy Now via WhatsApp
        </Link>

        <button onClick={handleShare} className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mx-auto">
          <Share2 size={13} /> Share this product
        </button>
      </div>
    </div>
  )
}
