import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/demo'],
        disallow: ['/dashboard/', '/auth/'],
      },
    ],
    sitemap: 'https://complexity-website.vercel.app/sitemap.xml',
  }
}
