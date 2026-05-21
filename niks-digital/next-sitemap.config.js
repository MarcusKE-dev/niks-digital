/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:  process.env.NEXT_PUBLIC_SITE_URL || 'https://niksdigital.co.ke',
  generateRobotsTxt: true,
  sitemapSize: 1000,
  changefreq: 'daily',
  priority: 0.7,

  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/server-sitemap.xml`,
    ],
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/api'] },
    ],
  },

  // Pages to exclude from sitemap
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/checkout',
    '/order-confirm/*',
  ],
}
