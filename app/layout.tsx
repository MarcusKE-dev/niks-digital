import type { Metadata, Viewport } from 'next'
import './globals.css'
import { validateEnv } from '@/lib/env'

const siteDescription =
  'Niks Digital Connections – best electronics shop in Kikuyu Town, Kiambu. Buy phones, laptops, TVs, audio systems, and accessories. M-Pesa accepted. Free delivery in Kikuyu.'

export const metadata: Metadata = {
  title: {
    default: 'Niks Digital Connections – Electronics Shop | Kikuyu Town',
    template: '%s | Niks Digital Connections',
  },
  description: siteDescription,
  keywords: [
    'electronics shop Kikuyu',
    'phone shop Kikuyu Town',
    'buy phone Kikuyu',
    'laptop shop Kikuyu',
    'TV shop Kikuyu',
    'speakers',
    'audio systems',
    'sub woofer',
    'sound bar',
    'accessories nairobi',
    'electronics nairobi',
    'electronics Kiambu',
    'phone accessories Kikuyu',
    'Niks Digital Connections',
    'electronics shop near me Kikuyu',
    'buy electronics M-Pesa Kenya',
    'smart watch Kikuyu',
    'computer accessories Kikuyu',
    'Niks Digital',
    'kitchen appliances Kikuyu',
  ],
  authors: [{ name: 'Niks Digital Connections' }],
  creator: 'Niks Digital Connections',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Niks Digital Connections',
    title: 'Niks Digital Connections – Electronics Shop Kikuyu',
    description: siteDescription,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#CC0000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') {
    try {
      validateEnv()
    } catch (err) {
      console.error('[Env Validation]', err)
      if (process.env.NODE_ENV === 'development') {
        throw err
      }
    }
  }

  return (
    <html lang="en-KE" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <meta name="google-site-verification" content="S1p_4TQKjc0dtqg6XMMSY3-hzrKGUHBcVDMJ0iomhRs" />

        {/* Favicon & manifest */}
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ElectronicsStore',
              name: 'Niks Digital Connections',
              image: 'https://niksdigital.co.ke/logo.png',
              url: 'https://niksdigital.co.ke',
              telephone: '+254798946124',
              priceRange: 'KES',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Kikuyu Town Centre',
                addressLocality: 'Kikuyu',
                addressRegion: 'Kiambu',
                postalCode: '00902',
                addressCountry: 'KE',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: -1.24410,
                longitude: 36.66391,
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                opens: '07:00',
                closes: '22:00',
              },
              paymentAccepted: 'M-Pesa, Cash',
              currenciesAccepted: 'KES',
              areaServed: ['Kikuyu','Limuru','Tigoni','Kinoo','Nairobi','Kiambu','Thika'],
              hasMap: 'https://maps.app.goo.gl/XzF7CnSNQzLwbvh2A',
            }),
          }}
        />
      </head>
      <body className="bg-surface text-dark antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/Toaster'

function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}