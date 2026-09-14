/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'

// Hosts the app is allowed to load images from. Kept in sync with
// `remotePatterns` below and with ALLOWED_IMAGE_HOSTS in lib/utils.ts.
const IMAGE_HOSTS = 'https://*.supabase.co https://res.cloudinary.com https://picsum.photos'

// Content Security Policy.
//
// `'unsafe-inline'` stays in script-src because the Next.js App Router
// bootstraps hydration with inline scripts and this app serves no
// user-authored HTML (the only dangerouslySetInnerHTML is a static
// JSON-LD block), so the residual risk is small. Everything else is
// locked down: no external scripts, no framing, no plugins, no
// cross-origin form posts, and connections only to Supabase.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: ${IMAGE_HOSTS}`,
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Two years, so the domain stays HTTPS-only even on a first visit.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Used by the sample catalogue data.
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [380, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 200, 256, 320, 400],
    // Stop the optimizer being used as an open SVG/HTML renderer.
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
  },

  async redirects() {
    return [
      {
        source: '/products',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/:slug',
        destination: '/shop/:slug',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Nothing under the admin panel or the API may be cached by a
        // shared proxy — these responses are per-user.
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ]
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
