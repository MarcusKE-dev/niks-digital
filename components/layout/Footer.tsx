// ════════════════════════════════════════════════════════════
// FOOTER — Site-wide footer
// 4-column layout: Brand | Quick Links | Categories | Contact
// Server component — no interactivity needed.
// ════════════════════════════════════════════════════════════

import Link from 'next/link'
import {
  Phone, Mail, MapPin, Clock,
  Facebook, Instagram, Youtube, Twitter,
  MessageCircle, ChevronRight,
} from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────

const QUICK_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/shop',    label: 'All Products' },
  { href: '/about',   label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/cart',    label: 'My Cart' },
] as const

const CATEGORY_LINKS = [
  { href: '/shop?category=televisions',   label: 'Televisions' },
  { href: '/shop?category=refrigerators', label: 'Refrigerators & Freezers' },
  { href: '/shop?category=cookers',       label: 'Cookers & Ovens' },
  { href: '/shop?category=laptops',       label: 'Laptops & Computers' },
  { href: '/shop?category=phones',        label: 'Mobile Phones' },
  { href: '/shop?category=audio',         label: 'Audio & Speakers' },
  { href: '/shop?category=cameras',       label: 'Cameras' },
  { href: '/shop?category=kitchen',       label: 'Kitchen Appliances' },
] as const

const SOCIAL_LINKS = [
  {
    href:  'https://facebook.com/niksdigital',
    label: 'Niks Digital on Facebook',
    icon:  Facebook,
  },
  {
    href:  'https://instagram.com/niksdigital',
    label: 'Niks Digital on Instagram',
    icon:  Instagram,
  },
  {
    href:  'https://twitter.com/niksdigital',
    label: 'Niks Digital on X (Twitter)',
    icon:  Twitter,
  },
  {
    href:  'https://youtube.com/@niksdigital',
    label: 'Niks Digital on YouTube',
    icon:  Youtube,
  },
  { href: 'https://tiktok.com/@niksdigital',
       label: 'TikTok',
      icon: null      },
] as const

const CONTACT_ITEMS = [
  {
    icon:  Phone,
    label: 'Phone',
    lines: ['+254 700 000 001', '+254 700 000 002'],
    href:  'tel:+254700000001',
  },
  {
    icon:  Mail,
    label: 'Email',
    lines: ['info@niksdigital.co.ke'],
    href:  'mailto:info@niksdigital.co.ke',
  },
  {
    icon:  MapPin,
    label: 'Address',
    lines: ['Kikuyu Town Centre', 'Kikuyu Town, Kiambu County, Kenya'],
    href:  'https://maps.google.com/?q=Kikuyu Town+Commercial+Centre+Nairobi',
  },
  {
    icon:  Clock,
    label: 'Hours',
    lines: ['Monday – Sunday', '8:00am – 7:00pm'],
    href:  null,
  },
] as const

const LEGAL_LINKS = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms',          label: 'Terms of Service' },
  { href: '/returns',        label: 'Returns Policy' },
] as const

// ── COMPONENT ─────────────────────────────────────────────────

export function Footer() {
  const year = new Date().getFullYear()

  return (
<footer className="bg-[#1A1A1A]" aria-label="Site footer">
      {/* ── MAIN FOOTER GRID ── */}
      <div className="container-site py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ── Column 1: Brand + Social ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex flex-col leading-none mb-4 group"
              aria-label="Niks Digital Connections — Home"
            >
              <span className="font-extrabold text-xl text-white">
                Niks&nbsp;<span className="text-primary">Digital</span>
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.12em] mt-1">
                Connection · Nairobi
              </span>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              Powering Modern Homes with Smart Electronics & Appliances.
              Your trusted source for TVs, fridges, laptops, cookers and more
              across Kenya.
            </p>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '254700000001'}?text=Hi! I'd like to enquire about a product.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-whatsapp text-white text-sm font-semibold hover:bg-green-600 transition-colors duration-normal mb-6"
            >
              <MessageCircle size={16} aria-hidden />
              Chat on WhatsApp
            </a>

            {/* Social icons */}
            <div className="flex items-center gap-2" role="list" aria-label="Social media links">
             {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
    aria-label={label}
    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:bg-primary hover:border-primary transition-all duration-normal">
    {Icon
      ? <Icon size={16} aria-hidden />
      : (
        // TikTok SVG icon
        <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
        </svg>
      )
    }
  </a>
))}
            </div>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors duration-fast"
                    >
                      <ChevronRight
                        size={13}
                        className="text-white/20 group-hover:text-primary transition-colors flex-shrink-0"
                        aria-hidden
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Column 3: Categories ── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">
              Shop Categories
            </h3>
            <nav aria-label="Footer product categories">
              <ul className="space-y-2.5">
                {CATEGORY_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors duration-fast"
                    >
                      <ChevronRight
                        size={13}
                        className="text-white/20 group-hover:text-primary transition-colors flex-shrink-0"
                        aria-hidden
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Column 4: Contact Info ── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">
              Contact Info
            </h3>
            <address className="not-italic space-y-4">
              {CONTACT_ITEMS.map(({ icon: Icon, label, lines, href }) => (
                <div key={label} className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5"
                    aria-hidden
                  >
                    <Icon size={15} className="text-primary" />
                  </div>

                  {/* Text */}
                  <div>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="group"
                        aria-label={label}
                      >
                        {lines.map((line, i) => (
                          <span
                            key={i}
                            className="block text-sm text-white/50 group-hover:text-white transition-colors duration-fast leading-snug"
                          >
                            {line}
                          </span>
                        ))}
                      </a>
                    ) : (
                      lines.map((line, i) => (
                        <span
                          key={i}
                          className="block text-sm text-white/50 leading-snug"
                        >
                          {line}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </address>
          </div>

        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-white/10">
        <div className="container-site py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Copyright */}
            <p className="text-xs text-white/30 text-center sm:text-left">
              © {year} Niks Digital Connections. All rights reserved.
              Kikuyu Town, Kiambu County, Kenya.
            </p>

            {/* Legal links */}
            <nav aria-label="Legal links">
              <ul className="flex items-center gap-4">
                {LEGAL_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors duration-fast"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

    </footer>
  )
}
