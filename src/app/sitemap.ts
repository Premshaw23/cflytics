import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/dashboard',
    '/problems',
    '/contests',
    '/submissions',
    '/compare',
    '/analytics',
    '/bookmarks',
    '/notes',
    '/settings',
    '/about',
    '/blog',
    '/contact',
    '/privacy',
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
