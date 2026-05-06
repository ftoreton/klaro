import type { TermeTechnique } from './types';
import React from 'react';

// ─────────────────────────────────────────────────────
// Détection automatique des termes techniques dans un texte.
// Retourne un tableau de "tokens" : du texte brut OU un terme à annoter.
// L'annotation se fait au rendu via TermePopover (pas de dangerouslySetInnerHTML).
// ─────────────────────────────────────────────────────

export type Token =
  | { type: 'text'; value: string }
  | { type: 'term'; value: string; definition: string };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Construit une regex insensible à la casse, alternant tous les termes,
// avec frontières de mots fonctionnelles aussi pour les termes contenant
// des accents et tirets (les \b classiques ne marchent pas bien).
function buildPattern(termes: TermeTechnique[]): RegExp | null {
  if (termes.length === 0) return null;
  // Trier par longueur descendante pour matcher d'abord les expressions longues.
  const sorted = [...termes].sort((a, b) => b.terme.length - a.terme.length);
  const alternation = sorted.map((t) => escapeRegex(t.terme)).join('|');
  // (?<![\\p{L}\\p{N}_])  : pas de lettre/chiffre juste avant
  // (?![\\p{L}\\p{N}_])   : pas de lettre/chiffre juste après
  // 'gi' pour repérer toutes les occurrences sans tenir compte de la casse
  // 'u' pour le support Unicode des classes de propriétés
  return new RegExp(`(?<![\\p{L}\\p{N}_])(${alternation})(?![\\p{L}\\p{N}_])`, 'giu');
}

export function tokenize(text: string, termes: TermeTechnique[]): Token[] {
  const pattern = buildPattern(termes);
  if (!pattern) return [{ type: 'text', value: text }];

  // Map insensible à la casse pour retrouver la définition à partir du match
  const dict = new Map<string, string>();
  termes.forEach((t) => dict.set(t.terme.toLowerCase(), t.definition_simple));

  const tokens: Token[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (start > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, start) });
    }
    const matched = m[0];
    const def = dict.get(matched.toLowerCase()) ?? '';
    tokens.push({ type: 'term', value: matched, definition: def });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

// Hook pratique pour mémoïser le découpage (utilisé par AnnotatedText).
export function useTokens(text: string, termes: TermeTechnique[]): Token[] {
  return React.useMemo(() => tokenize(text, termes), [text, termes]);
}
