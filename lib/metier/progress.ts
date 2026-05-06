import type { Etape, SousTache, StatutEtape, NiveauSousTache, ModeUtilisateur } from './types';

// Sous-tâches visibles selon le mode utilisateur
export function visibleSousTaches(sousTaches: SousTache[], mode: ModeUtilisateur): SousTache[] {
  if (mode === 'expert') return sousTaches;
  if (mode === 'intermediaire') return sousTaches.filter((st) => st.niveau !== 'expert');
  return sousTaches.filter((st) => st.niveau === 'debutant');
}

// Combien de sous-tâches sont masquées par le mode actuel
export function hiddenSousTachesCount(sousTaches: SousTache[], mode: ModeUtilisateur): number {
  return sousTaches.length - visibleSousTaches(sousTaches, mode).length;
}

// Compute statut d'une étape selon les sous-tâches cochées (toutes niveaux confondus)
export function computeStatut(sousTaches: SousTache[], explicit?: StatutEtape): StatutEtape {
  if (explicit === 'done') return 'done';
  if (sousTaches.length === 0) return explicit ?? 'todo';
  const done = sousTaches.filter((st) => st.done).length;
  if (done === 0) return 'todo';
  if (done === sousTaches.length) return 'done';
  return 'in_progress';
}

// Progression globale du métier
export function metierProgress(etapes: Etape[]): { done: number; total: number; pct: number } {
  const total = etapes.length;
  const done = etapes.filter((e) => e.statut === 'done').length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}
