import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://btcstore.com';
  const locales = ['tr', 'en', 'de', 'fr', 'es', 'ar'];
  
  const routes = [
    '',
    '/products',
    '/references',
    '/stories',
    '/call-request',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemap;
}
