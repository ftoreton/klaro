import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import type { ArticleMeta } from '@/lib/blog/types';
import { formatPublishedDate } from '@/lib/blog/format';

interface Props {
  article: ArticleMeta;
}

// Carte d'article pour les grilles de listing. Server Component — pas
// d'interactivité, juste un Link englobant.
export default function ArticleCard({ article }: Props) {
  return (
    <Link href={`/blog/${article.slug}`} className="blog-card">
      <div className="blog-card-image">
        <Image
          src={article.coverImage}
          alt={article.coverImageAlt}
          fill
          sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw"
          className="blog-card-img"
        />
      </div>
      <div className="blog-card-body">
        <h3 className="blog-card-title">{article.title}</h3>
        <p className="blog-card-desc">{article.description}</p>
        <div className="blog-card-meta">
          <time dateTime={article.publishedAt.toISOString()}>
            {formatPublishedDate(article.publishedAt)}
          </time>
          <span className="blog-card-dot" aria-hidden>·</span>
          <span className="blog-card-reading">
            <Clock size={12} />
            {article.readingTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
