// Helpers de lecture des articles MDX depuis `content/blog/`.
// Server-only : utilisé par les Server Components, sitemap, robots.
// Les articles sont parsés au build (SSG via generateStaticParams).
//
// Pas de cache explicite : Next.js déduplique les appels à la lecture FS
// pendant un même render (memoization React + SSG).

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTimeFn from 'reading-time';
import type { Article, ArticleFrontmatter, ArticleMeta } from './types';

// Path override possible via env var pour les tests (cf. queries.test.ts).
// Production lit toujours `content/blog/` à la racine du projet.
function getContentDir(): string {
  return process.env.BLOG_CONTENT_DIR || path.join(process.cwd(), 'content', 'blog');
}

// ─────────────────────────────────────────────────────
// Lecture des fichiers .mdx du dossier content/blog/
// ─────────────────────────────────────────────────────

function listMdxFiles(): string[] {
  const dir = getContentDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => path.join(dir, name));
}

// Validation stricte du frontmatter — fail build plutôt que rendu cassé.
function validateFrontmatter(data: Record<string, unknown>, file: string): ArticleFrontmatter {
  const required: (keyof ArticleFrontmatter)[] = [
    'title',
    'slug',
    'description',
    'publishedAt',
    'author',
    'coverImage',
    'coverImageAlt',
  ];
  for (const key of required) {
    if (typeof data[key] !== 'string' || (data[key] as string).trim() === '') {
      throw new Error(`[blog] Frontmatter invalide dans ${path.basename(file)} : champ "${key}" manquant ou vide.`);
    }
  }

  // Date parseable ?
  const publishedAt = new Date(data.publishedAt as string);
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error(`[blog] Frontmatter invalide dans ${path.basename(file)} : "publishedAt" n'est pas une date ISO valide.`);
  }

  if (data.updatedAt !== undefined) {
    const updatedAt = new Date(data.updatedAt as string);
    if (Number.isNaN(updatedAt.getTime())) {
      throw new Error(`[blog] Frontmatter invalide dans ${path.basename(file)} : "updatedAt" n'est pas une date ISO valide.`);
    }
  }

  return data as unknown as ArticleFrontmatter;
}

// Parse un fichier MDX → Article. Renvoie aussi le content brut pour MDXRemote/rsc.
function parseFile(file: string): Article {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const fm = validateFrontmatter(data, file);

  const stats = readingTimeFn(content);

  return {
    slug: fm.slug,
    title: fm.title,
    description: fm.description,
    publishedAt: new Date(fm.publishedAt),
    updatedAt: fm.updatedAt ? new Date(fm.updatedAt) : undefined,
    author: fm.author,
    coverImage: fm.coverImage,
    coverImageAlt: fm.coverImageAlt,
    featured: fm.featured ?? false,
    tags: fm.tags ?? [],
    readingTime: stats.text.replace('read', 'de lecture').replace('min', 'min'),
    content,
  };
}

// ─────────────────────────────────────────────────────
// API publique
// ─────────────────────────────────────────────────────

// Renvoie tous les articles triés par date de publication décroissante.
// Détecte les slugs en doublon → erreur au build.
export function getAllArticles(): Article[] {
  const files = listMdxFiles();
  const articles = files.map(parseFile);

  // Garde-fou : pas deux articles avec le même slug
  const slugs = new Set<string>();
  for (const a of articles) {
    if (slugs.has(a.slug)) {
      throw new Error(`[blog] Slug en doublon : "${a.slug}" — deux articles ne peuvent pas partager le même slug.`);
    }
    slugs.add(a.slug);
  }

  return articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

// Renvoie un article par slug, ou null s'il n'existe pas.
export function getArticleBySlug(slug: string): Article | null {
  const articles = getAllArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}

// Article à la une : featured: true ET le plus récent. Fallback sur le plus
// récent tout court si aucun featured.
export function getFeaturedArticle(): Article | null {
  const articles = getAllArticles();
  if (articles.length === 0) return null;
  const featured = articles.find((a) => a.featured === true);
  return featured ?? articles[0];
}

// Tous les articles SAUF celui à la une — pour la grille de la page /blog.
export function getArticlesExceptFeatured(): Article[] {
  const all = getAllArticles();
  const featured = getFeaturedArticle();
  if (!featured) return all;
  return all.filter((a) => a.slug !== featured.slug);
}

// Liste légère des méta pour les listings (pas de content lourd).
export function getAllArticleMeta(): ArticleMeta[] {
  return getAllArticles().map(({ content: _content, ...meta }) => meta);
}
