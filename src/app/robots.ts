import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login'],
    },
    sitemap: 'https://wellspeak.vercel.app/sitemap.xml',
  };
}
