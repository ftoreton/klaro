import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

// /robots.txt généré dynamiquement par Next.js depuis ce fichier.
// On bloque l'indexation Google des pages connectées (dashboard, onboarding,
// /chantier, paramètres, estimation) — pas de valeur SEO et redirigent
// vers /connexion sans auth.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/onboarding',
          '/dashboard',
          '/chantier',
          '/parametres',
          '/estimation',
          '/alertes',
          '/taches',
          '/calendrier',
          '/budget',
          '/devis',
          '/documents',
          '/messages',
          '/metiers',
          '/auth',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
