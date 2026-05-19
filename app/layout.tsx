// ════════════════════════════════════════════════════════════
// ROOT LAYOUT — app/layout.tsx
// Wraps every page. Sets: metadata, font, providers.
// ════════════════════════════════════════════════════════════

import type { Metadata, Viewport } from 'next'
import './globals.css'

// ── METADATA ─────────────────────────────────────────────────
// These are the site-wide defaults. Individual pages can
// override them using their own generateMetadata() export.

export const metadata: Metadata = {
  // ── Basic
  title: {
    default:  'Niks Digital Connection – Electronics & Home Appliances | Nairobi',
    template: '%s | Niks Digital Connection',
  },
  description:
    'Shop the best TVs, refrigerators, laptops, cookers, phones and more in Nairobi, Kenya. ' +
    'Genuine products · Kenyan-friendly prices · Free Nairobi delivery · M-Pesa accepted.',

  // ── Keywords (basic SEO)
  keywords: [
    'electronics shop Nairobi',
    'home appliances Kenya',
    'buy TV Nairobi',
    'buy fridge Nairobi',
    'buy laptop Nairobi',
    'buy phone Nairobi',
    'Samsung LG Sony HP appliances Kenya',
    'Niks Digital Connection',
    'M-Pesa electronics',
  ],

  // ── Author
  authors: [{ name: 'Niks Digital Connection' }],
  creator: 'Niks Digital Connection',
  publisher: 'Niks Digital Connection',

  // ── Open Graph (social media previews)
  openGraph: {
    type:        'website',
    locale:      'en_KE',
    url:         process.env.NEXT_PUBLIC_SITE_URL ?? 'https://niksdigital.co.ke',
    siteName:    'Niks Digital Connection',
    title:       'Niks Digital Connection – Smart Electronics & Home Appliances',
    description:
      'Powering Modern Homes with Smart Electronics & Appliances. ' +
      'Kenya\'s trusted source for TVs, fridges, laptops and more.',
    images: [
      {
        url:    '/og-image.jpg',     // 1200×630 — add this to /public
        width:  1200,
        height: 630,
        alt:    'Niks Digital Connection – Electronics Shop Nairobi',
      },
    ],
  },

  // ── Twitter / X
  twitter: {
    card:        'summary_large_image',
    title:       'Niks Digital Connection – Electronics & Appliances',
    description: 'Powering Modern Homes with Smart Electronics & Appliances.',
    images:      ['/og-image.jpg'],
  },

  // ── Robots
  robots: {
    index:     true,
    follow:    true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  // ── Icons (put these files in /public)
  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon-16x16.png',
    apple:       '/apple-touch-icon.png',
    other: [
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-32x32.png' },
    ],
  },

  // ── Web manifest (for PWA-like home screen icon)
  manifest: '/site.webmanifest',

  // ── Verification (add your Google Search Console code here)
  // verification: { google: 'your-verification-code' },
}

// ── VIEWPORT ─────────────────────────────────────────────────

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor:   '#FF6200',   // browser UI accent (Android Chrome)
}

// ── ROOT LAYOUT ───────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-KE" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured data — Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':    'ElectronicsStore',
              name:       'Niks Digital Connection',
              description:
                'Nairobi-based electronics and home appliance shop. ' +
                'Selling TVs, refrigerators, laptops, cookers, phones and more.',
              url:    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://niksdigital.co.ke',
              logo:   `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
              image:  `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
              telephone: '+254700000001',
              email:     'info@niksdigital.co.ke',
              address: {
                '@type':           'PostalAddress',
                streetAddress:     'Shop 12, Westlands Commercial Centre',
                addressLocality:   'Westlands',
                addressRegion:     'Nairobi',
                addressCountry:    'KE',
              },
              geo: {
                '@type':    'GeoCoordinates',
                latitude:   -1.2634,
                longitude:   36.8031,
              },
              openingHoursSpecification: {
                '@type':      'OpeningHoursSpecification',
                dayOfWeek:    [
                  'Monday','Tuesday','Wednesday',
                  'Thursday','Friday','Saturday','Sunday'
                ],
                opens:  '08:00',
                closes: '19:00',
              },
              paymentAccepted: ['M-Pesa', 'Cash', 'Credit Card', 'Debit Card'],
              priceRange: 'KES 3,500 – KES 120,000',
              currenciesAccepted: 'KES',
              areaServed: {
                '@type': 'City',
                name:    'Nairobi',
              },
            }),
          }}
        />
      </head>

      <body className="bg-surface text-dark antialiased">
        {/*
          ──────────────────────────────────────────────────────
          PROVIDERS
          Wrap children with any providers needed site-wide.
          We're keeping providers minimal — Zustand works
          without a provider, so we only need this wrapper
          for future additions (e.g. toast context).
          ──────────────────────────────────────────────────────
        */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// ── PROVIDERS ─────────────────────────────────────────────────
// Client component that wraps the app with any context providers.
// Currently minimal — add providers here as the app grows.

import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/Toaster'

function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Global toast notifications */}
      <Toaster />
    </>
  )
}
