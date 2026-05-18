import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import MarketingShell from '@/components/marketing/MarketingShell';
import CTAKlaro from '@/components/blog/CTAKlaro';
import { getAllArticles, getArticleBySlug } from '@/lib/blog/queries';
import { formatPublishedDate } from '@/lib/blog/format';
import { SITE_URL } from '@/lib/site-config';
import '../blog.css';

// ─── SSG : pré-génère une page par slug au build ───
export function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

// ─── Metadata dynamique par article ───────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article introuvable | Klaro Blog' };

  const url = `${SITE_URL}/blog/${article.slug}`;
  const imageUrl = article.coverImage.startsWith('http')
    ? article.coverImage
    : `${SITE_URL}${article.coverImage}`;

  return {
    title: `${article.title} | Klaro Blog`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.description,
      siteName: 'Klaro',
      locale: 'fr_FR',
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: (article.updatedAt ?? article.publishedAt).toISOString(),
      authors: [article.author],
      images: [
        {
          url: imageUrl,
          width: 1600,
          height: 900,
          alt: article.coverImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [imageUrl],
    },
  };
}

// ─── Composants custom autorisés dans le MDX ───────
// `CTAKlaro` est le seul composant exposé en V1. Pour ajouter des composants
// (ex. <Callout>, <BlogImage>), enrichir cet objet.
const mdxComponents = {
  CTAKlaro,
};

// ─── Compile + run MDX au build (SSG) ──────────────
// On utilise @mdx-js/mdx directement pour contourner les incompatibilités
// React entre next-mdx-remote/rsc et Next.js 15.5.
async function MdxContent({ source }: { source: string }) {
  const compiled = await compile(source, {
    outputFormat: 'function-body',
    development: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: Content } = (await run(String(compiled), {
    ...runtime,
    baseUrl: import.meta.url,
  } as never)) as { default: React.ComponentType<{ components?: typeof mdxComponents }> };
  return <Content components={mdxComponents} />;
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // JSON-LD Schema.org Article — injecté en <script> dans la page.
  // Données absorbées par Google pour la rich card.
  const imageAbsoluteUrl = article.coverImage.startsWith('http')
    ? article.coverImage
    : `${SITE_URL}${article.coverImage}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: imageAbsoluteUrl,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Klaro',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="blog-article">
        <Link href="/blog" className="blog-article-back">
          <ArrowLeft size={14} />
          Retour au blog
        </Link>

        <div className="blog-article-cover">
          <Image
            src={article.coverImage}
            alt={article.coverImageAlt}
            fill
            priority
            sizes="(max-width: 720px) 100vw, 720px"
            className="blog-article-cover-img"
          />
        </div>

        <h1 className="blog-article-title">{article.title}</h1>

        <div className="blog-article-meta">
          <time dateTime={article.publishedAt.toISOString()}>
            {formatPublishedDate(article.publishedAt)}
          </time>
          <span className="blog-card-dot" aria-hidden>·</span>
          <span className="blog-card-reading">
            <Clock size={12} />
            {article.readingTime}
          </span>
          <span className="blog-card-dot" aria-hidden>·</span>
          <span className="blog-article-author">{article.author}</span>
        </div>

        {/* Contenu MDX compilé côté serveur (RSC) — zéro JS client */}
        <div className="blog-content">
          <MdxContent source={article.content} />
        </div>

        {/* CTA fin d'article — toujours présent même si l'auteur n'en a pas mis en milieu */}
        <CTAKlaro variant="end" />
      </article>
    </MarketingShell>
  );
}
