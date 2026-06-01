import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Niks Digital Connections – Electronics Shop | Kikuyu Town',
    template: '%s | Niks Digital Connections',
  },
  description:
    'Buy phones, TVs, laptops, speakers, kitchen appliances and electronics in Kikuyu Town. ' +
    'Best prices, M-Pesa accepted, free delivery in Kikuyu.',
  keywords: [
    'electronics shop Kikuyu',
    'buy phone Kikuyu',
    'buy TV Kikuyu',
    'phone accessories Kikuyu',
    'electronics Kiambu',
    'Niks Digital Connections',
    'smart watch Kikuyu',
    'kitchen appliances Kikuyu',
  ],
  authors: [{ name: 'Niks Digital Connections' }],
  creator: 'Niks Digital Connections',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Niks Digital Connections',
    title: 'Niks Digital Connections – Electronics Shop Kikuyu',
    description: 'Phones, TVs, laptops, speakers and more. Kikuyu Town, Kiambu.',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#CC0000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ElectronicsStore',
              name: 'Niks Digital Connections',
              description: 'Electronics and phone accessories shop in Kikuyu Town, Kiambu.',
              telephone: '+254798946124',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Kikuyu Town Centre',
                addressLocality: 'Kikuyu',
                addressRegion: 'Kiambu',
                addressCountry: 'KE',
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '08:00',
                closes: '19:00',
              },
              paymentAccepted: ['M-Pesa', 'Cash', 'Credit Card'],
              priceRange: 'KES 500 – KES 150,000',
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
