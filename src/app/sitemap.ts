import { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://desifusionbites.com';
  const [products, categories] = await Promise.all([
    getProducts({ includeUnpublished: false }),
    getCategories(false),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/wholesale`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/refunds`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/products?category=${c.slug}`,
    lastModified: new Date(c.updated_at || c.created_at || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
