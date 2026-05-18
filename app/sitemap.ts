import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/blog/queries';
import { SITE_URL } from '@/lib/site-config';

// Sitemap.xml généré automatiquement par Next.js depuis ce fichier.
// Convention App Router : `app/sitemap.ts` → /sitemap.xml
//
// On inclut :
//  - les pages publiques principales (landing, /blog, /offres, /faq)
//  - tous les articles /blog/[slug]
// On exclut les pages connectées (dashboard, /chantier, /parametres…) :
// pas de valeur SEO et inaccessibles sans auth.

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/offres`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/blog/${article.slug}`,
    lastModified: article.updatedAt ?? article.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes];
}
