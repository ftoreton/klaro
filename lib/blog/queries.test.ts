// Tests des helpers de lecture MDX. Utilise les fixtures de `__fixtures__/`
// isolées de la prod (`content/blog/`).

import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// IMPORTANT : on définit BLOG_CONTENT_DIR AVANT d'importer queries.ts.
// L'import dynamique évite que le module soit chargé avant la config.
process.env.BLOG_CONTENT_DIR = path.join(__dirname, '__fixtures__');

const queries = await import('./queries');
const {
  getAllArticles,
  getArticleBySlug,
  getArticlesExceptFeatured,
  getFeaturedArticle,
} = queries;

beforeAll(() => {
  process.env.BLOG_CONTENT_DIR = path.join(__dirname, '__fixtures__');
});

afterAll(() => {
  delete process.env.BLOG_CONTENT_DIR;
});

describe('getAllArticles', () => {
  it('retourne les 2 fixtures', () => {
    const all = getAllArticles();
    const slugs = all.map((a) => a.slug);
    expect(slugs).toContain('test-article-a');
    expect(slugs).toContain('test-article-b');
  });

  it('trie par publishedAt décroissant (B = juin 15 avant A = juin 1)', () => {
    const all = getAllArticles();
    const indexA = all.findIndex((a) => a.slug === 'test-article-a');
    const indexB = all.findIndex((a) => a.slug === 'test-article-b');
    expect(indexB).toBeLessThan(indexA);
  });

  it('calcule un readingTime non vide', () => {
    const a = getArticleBySlug('test-article-a');
    expect(a?.readingTime).toBeTruthy();
    expect(typeof a?.readingTime).toBe('string');
  });

  it('parse les champs du frontmatter correctement', () => {
    const a = getArticleBySlug('test-article-a');
    expect(a).not.toBeNull();
    expect(a!.title).toBe('Article A');
    expect(a!.author).toBe('Florent');
    expect(a!.featured).toBe(true);
    expect(a!.publishedAt).toBeInstanceOf(Date);
  });

  it("featured: undefined → traité comme false", () => {
    const b = getArticleBySlug('test-article-b');
    expect(b?.featured).toBe(false);
  });
});

describe('getArticleBySlug', () => {
  it('renvoie null pour un slug inexistant', () => {
    expect(getArticleBySlug('slug-qui-existe-pas')).toBeNull();
  });
});

describe('getFeaturedArticle', () => {
  it('renvoie l’article featured (A) même s’il n’est pas le plus récent', () => {
    const featured = getFeaturedArticle();
    expect(featured?.slug).toBe('test-article-a');
  });
});

describe('getArticlesExceptFeatured', () => {
  it('exclut l’article featured de la liste', () => {
    const list = getArticlesExceptFeatured();
    const slugs = list.map((a) => a.slug);
    expect(slugs).not.toContain('test-article-a');
    expect(slugs).toContain('test-article-b');
  });
});
