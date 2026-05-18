// ─────────────────────────────────────────────────────
// Blog — contrat de données des articles MDX.
// La source de vérité est `content/blog/*.mdx`. Le frontmatter est parsé par
// `lib/blog/queries.ts` au moment du build (SSG).
// ─────────────────────────────────────────────────────

// Méta-données d'un article — ce qu'on extrait du frontmatter + des calculs
// dérivés (readingTime). Pas de content : utilisé pour les listings.
export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  coverImage: string;
  coverImageAlt: string;
  featured?: boolean;
  tags?: string[];
  readingTime: string; // ex. "5 min"
}

// Article complet (méta + contenu MDX brut prêt à être compilé via
// next-mdx-remote/rsc).
export interface Article extends ArticleMeta {
  content: string;
}

// Forme attendue du frontmatter dans le fichier MDX. Validation faite par
// `queries.ts` au parsing.
export interface ArticleFrontmatter {
  title: string;
  slug: string;
  description: string;
  publishedAt: string; // ISO date string
  updatedAt?: string;
  author: string;
  coverImage: string;
  coverImageAlt: string;
  featured?: boolean;
  tags?: string[];
}
