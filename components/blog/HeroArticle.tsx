import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import type { ArticleMeta } from '@/lib/blog/types';
import { formatPublishedDate } from '@/lib/blog/format';

interface Props {
  article: ArticleMeta;
}

// Article à la une — gros format sur la page /blog. Server Component.
export default function HeroArticle({ article }: Props) {
  return (
    <Link href={`/blog/${article.slug}`} className="blog-hero">
      <div className="blog-hero-image">
        <Image
          src={article.coverImage}
          alt={article.coverImageAlt}
          fill
          priority
          sizes="(max-width: 720px) 100vw, 1080px"
          className="blog-hero-img"
        />
        <span className="blog-hero-badge" aria-hidden>
          <Sparkles size={12} />
          À la une
        </span>
      </div>

      <div className="blog-hero-body">
        <h1 className="blog-hero-title">{article.title}</h1>
        <p className="blog-hero-desc">{article.description}</p>

        <div className="blog-hero-meta">
          <time dateTime={article.publishedAt.toISOString()}>
            {formatPublishedDate(article.publishedAt)}
          </time>
          <span className="blog-card-dot" aria-hidden>·</span>
          <span className="blog-card-reading">
            <Clock size={12} />
            {article.readingTime}
          </span>
        </div>

        <span className="blog-hero-cta">
          Lire l&apos;article
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
