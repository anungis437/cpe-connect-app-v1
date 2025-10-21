/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://cpe-connect.com',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*'],
  additionalPaths: async (config) => [
    await config.transform(config, '/en'),
    await config.transform(config, '/fr'),
  ],
  alternateRefs: [
    {
      href: 'https://cpe-connect.com/en',
      hreflang: 'en',
    },
    {
      href: 'https://cpe-connect.com/fr',
      hreflang: 'fr',
    },
  ],
}