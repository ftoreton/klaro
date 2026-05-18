import type { Metadata } from 'next';
import MarketingShell from '@/components/marketing/MarketingShell';
import ArticleCard from '@/components/blog/ArticleCard';
import HeroArticle from '@/components/blog/HeroArticle';
import { getArticlesExceptFeatured, getFeaturedArticle } from '@/lib/blog/queries';
import { SITE_URL } from '@/lib/site-config';
import './blog.css';

export const metadata: Metadata = {
  title: 'Blog Klaro — Conseils pour ta rénovation',
  description:
    "Retours d'expérience, méthodes éprouvées, erreurs à éviter en rénovation. " +
    'Écrit par Florent qui a rénové sa maison seul pendant 2 ans.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/blog`,
    title: 'Blog Klaro — Conseils pour ta rénovation',
    description: "Retours d'expérience, méthodes éprouvées, erreurs à éviter en rénovation.",
    siteName: 'Klaro',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Klaro — Conseils pour ta rénovation',
    description: "Retours d'expérience en rénovation, par Florent.",
  },
};

export default function BlogIndexPage() {
  const featured = getFeaturedArticle();
  const others = getArticlesExceptFeatured();
  const hasAny = featured !== null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    url: `${SITE_URL}/blog`,
    name: 'Blog Klaro',
    description: "Conseils pour ta rénovation — par Florent Toreton",
    publisher: {
      '@type': 'Organization',
      name: 'Klaro',
      url: SITE_URL,
    },
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="blog-root">
        <header className="blog-page-head">
          <p className="blog-eyebrow">Le blog Klaro</p>
          <h1 className="blog-page-title">Conseils pour ta rénovation</h1>
          <p className="blog-page-sub">
            Retours d&apos;expérience, méthodes éprouvées, erreurs à éviter. Écrit par Florent
            qui a rénové sa maison seul pendant 2 ans.
          </p>
        </header>

        {!hasAny ? (
          <div className="blog-empty">
            Bientôt les premiers articles, reviens vite&nbsp;!
          </div>
        ) : (
          <>
            <HeroArticle article={featured} />

            {others.length > 0 && (
              <section className="blog-section">
                <h2 className="blog-section-title">Tous les articles</h2>
                <div className="blog-grid">
                  {others.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </MarketingShell>
  );
}
