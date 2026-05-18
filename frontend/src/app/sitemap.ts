import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pet-community-xi.vercel.app';
  const locales = ['en', 'ko', 'es', 'fr', 'de', 'nl', 'da'];
  
  // Public pages
  const routes = [
    '',
    '/dashboard',
    '/dashboard/search',
  ];
  
  // Generate sitemap entries for all locales
  const sitemap: MetadataRoute.Sitemap = [];
  
  locales.forEach(locale => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });
  
  return sitemap;
}
