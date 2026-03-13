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
    sitemap: 'https://www.complexity-ai.fr/sitemap.xml',
  }
}
