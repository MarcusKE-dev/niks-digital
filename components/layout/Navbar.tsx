'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ShoppingCart, Menu, MessageCircle, Heart,
  Tv2, Refrigerator, FlameKindling, Laptop,
  Smartphone, Music2, Camera, UtensilsCrossed, X, Zap, Watch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartCount } from '@/store/cartStore'
import { CartCountBadge } from '@/components/ui/Badge'
import { MobileMenu } from '@/components/layout/MobileMenu'

const CATEGORIES = [
  { slug: 'phones', label: 'Phones & Accessories', icon: Smartphone },
  { slug: 'computers', label: 'Computer Accessories', icon: Laptop },
  { slug: 'tvs', label: 'Televisions', icon: Tv2 },
  { slug: 'audio', label: 'Audio & Speakers', icon: Music2 },
  { slug: 'kitchen', label: 'Kitchen Appliances', icon: UtensilsCrossed },
  { slug: 'electronics', label: 'Basic Electronics', icon: Zap },
  { slug: 'wearables', label: 'Smart Watches', icon: Watch },
] as const

export function Navbar() {
  const router = useRouter()
  const cartCount = useCartCount()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const q = searchQuery.trim()
      if (!q) return
      router.push(`/shop?search=${encodeURIComponent(q)}`)
      setSearchQuery('')
      setSearchOpen(false)
    },
    [searchQuery, router]
  )

  const openMobileSearch = () => {
    setSearchOpen(true)
    setTimeout(() => mobileSearchRef.current?.focus(), 50)
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-sticky bg-white',
          'transition-shadow duration-normal',
          scrolled && 'shadow-[0_1px_8px_rgba(0,0,0,0.08)]'
        )}
      >
        <div className="container-site">
          <div className="flex items-center h-16 lg:h-[68px] relative">

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="lg:hidden flex-shrink-0 -ml-1 w-10 h-10 flex items-center justify-center rounded-lg text-dark hover:bg-surface transition-colors"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link
              href="/"
              aria-label="Home"
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:left-auto lg:translate-x-0 flex-shrink-0"
            >
              <img src="/logo.png" alt="Niks Digital Connections" className="h-20 w-auto" />
            </Link>

            {/* Desktop search bar */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="hidden md:flex flex-1 max-w-xl items-center ml-4"
            >
              <div className={cn(
                'flex items-center w-full',
                'bg-surface border border-border rounded-full',
                'px-4 py-2.5 gap-3',
                'focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(255,98,0,0.10)]'
              )}>
                <Search size={16} className="text-muted flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search TVs, fridges, laptops, phones..."
                  className="flex-1 bg-transparent outline-none text-sm text-dark placeholder:text-muted"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="text-muted hover:text-dark"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Mobile search icon */}
              <button
                onClick={openMobileSearch}
                aria-label="Search products"
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-dark hover:bg-surface"
              >
                <Search size={20} />
              </button>

              {/* WhatsApp button (desktop only) */}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '254700000001'}?text=Hi! I'm interested in a product from Niks Digital Connections.`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="hidden lg:flex items-center gap-2 h-9 px-4 rounded-full bg-whatsapp text-white text-sm font-semibold hover:bg-green-600 flex-shrink-0"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>

              {/* Wishlist icon */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-dark hover:bg-surface hover:text-primary transition-colors duration-fast flex-shrink-0"
              >
                <Heart size={22} />
              </Link>

              {/* Cart button */}
              <Link
                href="/cart"
                aria-label={`Shopping cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-dark hover:bg-surface hover:text-primary transition-colors duration-fast flex-shrink-0"
              >
                <ShoppingCart size={22} />
                <CartCountBadge count={cartCount} />
              </Link>
            </div>
          </div>
        </div>

        {/* Category strip desktop */}
        <div className="hidden lg:block border-t border-border">
          <div className="container-site">
            <nav className="flex items-center gap-0 -mx-1">
              {CATEGORIES.map(({ slug, label, icon: Icon }) => (
                <Link
                  key={slug}
                  href={`/shop?category=${slug}`}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-dark rounded-md mx-0.5 hover:text-primary hover:bg-orange-50 transition-colors whitespace-nowrap group"
                >
                  <Icon size={14} className="text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile search overlay */}
        {searchOpen && (
          <div className="md:hidden absolute inset-x-0 top-0 z-modal bg-white shadow-dropdown p-3 flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3 bg-surface border border-border rounded-full px-4 py-2.5 focus-within:border-primary">
              <Search size={16} className="text-muted" />
              <input
                ref={mobileSearchRef}
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent outline-none text-sm text-dark placeholder:text-muted"
                autoComplete="off"
              />
            </form>
            <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-sm font-medium text-dark px-2">
              Cancel
            </button>
          </div>
        )}
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}