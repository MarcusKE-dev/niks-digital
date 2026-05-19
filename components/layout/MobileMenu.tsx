'use client'

// ════════════════════════════════════════════════════════════
// MOBILE MENU — Full-screen slide-in drawer for mobile nav
// Triggered by the hamburger button in the Navbar.
// ════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import Link                  from 'next/link'
import { usePathname }       from 'next/navigation'
import {
  X, Home, ShoppingBag, Info, Phone,
  Tv2, Refrigerator, FlameKindling, Laptop,
  Smartphone, Music2, Camera, UtensilsCrossed,
  MessageCircle, ChevronRight,
} from 'lucide-react'
import { cn }            from '@/lib/utils'
import { useCartCount }  from '@/store/cartStore'

// ── TYPES ─────────────────────────────────────────────────────

interface MobileMenuProps {
  isOpen:   boolean
  onClose:  () => void
}

// ── NAV DATA ─────────────────────────────────────────────────

const MAIN_LINKS = [
  { href: '/',        label: 'Home',     icon: Home },
  { href: '/shop',    label: 'Shop',     icon: ShoppingBag },
  { href: '/about',   label: 'About Us', icon: Info },
  { href: '/contact', label: 'Contact',  icon: Phone },
] as const

const CATEGORY_LINKS = [
  { href: '/shop?category=televisions',  label: 'Televisions',       icon: Tv2 },
  { href: '/shop?category=refrigerators',label: 'Refrigerators',     icon: Refrigerator },
  { href: '/shop?category=cookers',      label: 'Cookers & Ovens',   icon: FlameKindling },
  { href: '/shop?category=laptops',      label: 'Laptops & PCs',     icon: Laptop },
  { href: '/shop?category=phones',       label: 'Mobile Phones',     icon: Smartphone },
  { href: '/shop?category=audio',        label: 'Audio & Speakers',  icon: Music2 },
  { href: '/shop?category=cameras',      label: 'Cameras',           icon: Camera },
  { href: '/shop?category=kitchen',      label: 'Kitchen Appliances',icon: UtensilsCrossed },
] as const

// ── COMPONENT ─────────────────────────────────────────────────

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname   = usePathname()
  const cartCount  = useCartCount()
  const drawerRef  = useRef<HTMLDivElement>(null)

  // Close on route change
  useEffect(() => { onClose() }, [pathname])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Trap focus inside drawer
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
  }, [isOpen])

  return (
    <>
      {/* ── BACKDROP ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm',
          'transition-opacity duration-300 ease-smooth',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* ── DRAWER ── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed top-0 left-0 bottom-0 z-drawer',
          'w-[85vw] max-w-[340px]',
          'bg-white shadow-drawer',
          'flex flex-col',
          'transition-transform duration-300 ease-smooth',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link href="/" onClick={onClose} className="flex flex-col leading-none">
            <span className="font-extrabold text-lg text-dark">
              Niks <span className="text-primary">Digital</span>
            </span>
            <span className="text-2xs text-muted uppercase tracking-widest mt-0.5">
              Connection
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'text-muted hover:text-dark hover:bg-surface',
              'transition-colors duration-fast'
            )}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4">

          {/* Main nav links */}
          <nav aria-label="Main navigation">
            <ul>
              {MAIN_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-5 py-3.5',
                        'text-sm font-semibold',
                        'transition-colors duration-fast',
                        isActive
                          ? 'text-primary bg-orange-50 border-r-2 border-primary'
                          : 'text-dark hover:bg-surface hover:text-primary'
                      )}
                    >
                      <Icon size={18} className="flex-shrink-0" aria-hidden />
                      <span>{label}</span>
                      {label === 'Shop' && cartCount > 0 && (
                        <span className="ml-auto bg-primary text-white text-2xs font-bold px-1.5 py-0.5 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Divider */}
          <div className="mx-5 my-3 border-t border-border" />

          {/* Category section */}
          <div className="px-5 mb-2">
            <p className="text-2xs font-bold uppercase tracking-widest text-muted mb-2">
              Shop by Category
            </p>
          </div>

          <nav aria-label="Product categories">
            <ul>
              {CATEGORY_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3',
                      'text-sm text-dark',
                      'hover:bg-surface hover:text-primary',
                      'transition-colors duration-fast group'
                    )}
                  >
                    <Icon
                      size={16}
                      className="flex-shrink-0 text-muted group-hover:text-primary transition-colors"
                      aria-hidden
                    />
                    <span>{label}</span>
                    <ChevronRight
                      size={14}
                      className="ml-auto text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer: WhatsApp CTA */}
        <div className="p-5 border-t border-border">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '254700000001'}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={cn(
              'flex items-center justify-center gap-2 w-full',
              'py-3 rounded-full',
              'bg-whatsapp text-white text-sm font-semibold',
              'hover:bg-green-600 transition-colors duration-fast',
              'no-tap-highlight'
            )}
          >
            <MessageCircle size={18} aria-hidden />
            Chat with Us on WhatsApp
          </a>

          <p className="text-center text-xs text-muted mt-3">
            Westlands, Nairobi · Mon–Sun 8am–7pm
          </p>
        </div>
      </div>
    </>
  )
}
