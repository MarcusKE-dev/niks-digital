'use client'

import { useEffect, useRef } from 'react'
import Link                  from 'next/link'
import { usePathname }       from 'next/navigation'

interface MobileMenuProps {
  isOpen:  boolean
  onClose: () => void
}

const MAIN_LINKS = [
  { href: '/',         label: 'Home',      icon: '🏠' },
  { href: '/shop',     label: 'Shop',      icon: '🛍️' },
  { href: '/wishlist', label: 'Wishlist',  icon: '❤️'  },
  { href: '/about',    label: 'About Us',  icon: 'ℹ️'  },
  { href: '/contact',  label: 'Contact',   icon: '📞' },
] as const

const CATEGORY_LINKS = [
  { href: '/shop?category=phones',      label: 'Phones & Accessories'  },
  { href: '/shop?category=computers',   label: 'Computer Accessories'  },
  { href: '/shop?category=tvs',         label: 'Televisions'           },
  { href: '/shop?category=audio',       label: 'Audio & Speakers'      },
  { href: '/shop?category=kitchen',     label: 'Kitchen Appliances'    },
  { href: '/shop?category=electronics', label: 'Basic Electronics'     },
  { href: '/shop?category=wearables',   label: 'Smart Watches'         },
] as const

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on route change
  useEffect(() => { onClose() }, [pathname])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function toggleDark() {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-xl flex flex-col lg:hidden transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link href="/" onClick={onClose} className="flex flex-col leading-none">
            <span className="font-extrabold text-xl text-dark">
              Niks <span className="text-primary">Digital</span>
            </span>
            <span className="text-2xs text-muted uppercase tracking-widest mt-0.5">
              Connections
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-surface transition-colors text-xl font-light"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">

          {/* Main links */}
          <nav aria-label="Main">
            {MAIN_LINKS.map(({ href, label, icon }) => (
              <Link key={href} href={href} onClick={onClose}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-dark hover:bg-surface hover:text-primary transition-colors">
                <span className="w-5 text-center">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-5 my-3 border-t border-border" />

          {/* Categories */}
          <p className="px-5 text-2xs font-bold uppercase tracking-widest text-muted mb-2">
            Shop by Category
          </p>
          <nav aria-label="Categories">
            {CATEGORY_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 text-sm text-dark hover:bg-surface hover:text-primary transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-5 my-3 border-t border-border" />

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 px-5 py-3.5 w-full text-sm font-semibold text-dark hover:bg-surface transition-colors"
          >
            <span className="w-5 text-center">🌙</span>
            Dark Mode
          </button>

          {/* Legal links */}
          <Link href="/legal" onClick={onClose}
            className="flex items-center gap-3 px-5 py-3 text-sm text-muted hover:text-primary transition-colors">
            <span className="w-5 text-center">📋</span>
            Privacy · Terms · Returns
          </Link>
        </div>

        {/* Footer - WhatsApp link (FIXED: added missing <a tag) */}
        <div className="p-5 border-t border-border">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '254798946124'}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            💬 Chat on WhatsApp
          </a>
          <p className="text-center text-xs text-muted mt-3">
            Kikuyu Town · Mon–Sun 7am–10pm
          </p>
        </div>
      </div>
    </>
  )
}