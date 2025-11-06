module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://plaplan.io', // change to your site
  generateRobotsTxt: true,           // (true) generate robots.txt
  sitemapSize: 5000,                 // split if > 50k urls
  changefreq: 'daily',
  priority: 0.7,
  autoLastmod: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      // disallow staging if needed:
      // { userAgent: '*', disallow: ['/staging'] }
    ],
    additionalSitemaps: [
      // if you have other sitemaps (e.g. images) list them here
      // 'https://pla.plan/sitemap-images.xml'
    ],
  },
  // optional: transform function to customize each entry
  // transform: async (config, url) => { return {...} }
};