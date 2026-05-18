// Configuration globale du site, partagée entre layout, blog, sitemap, robots.
//
// `SITE_URL` est utilisée pour résoudre les URLs absolues (canonical, og:url,
// JSON-LD, sitemap.xml). En local : http://localhost:3000. En prod :
// NEXT_PUBLIC_SITE_URL (à définir dans Vercel ou autre hébergeur).

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
