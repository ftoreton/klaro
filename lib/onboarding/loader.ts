// Charge la bibliothèque de tâches Klaro depuis `data/metiers/*.json`
// (source de vérité) et la normalise au format consommé par l'onboarding.
//
// Une "trade onboarding" (TradeKey) peut consommer 1 ou plusieurs JSON métier,
// avec un filtre optionnel sur les phases — pour découper certains métiers
// composites (charpente vs couverture, menuiseries ext vs int).

import type { TradeKey } from '@/data/onboarding/trades';
import { TRADE_LABEL_BY_KEY } from '@/data/onboarding/trades';

// Imports JSON statiques (bundle inclus à la compilation).
import demolitionV3 from '@/data/metiers/demolition-depose-v3.json';
import gosV3 from '@/data/metiers/maconnerie-gros-oeuvre-v3.json';
import toitureV3 from '@/data/metiers/toiture-charpente-couverture-v3.json';
import menuiseriesV3 from '@/data/metiers/menuiseries-v3.json';
import isolationV3 from '@/data/metiers/isolation-thermique-v3.json';
import electriciteV2 from '@/data/metiers/electricite-v2.json';
import plomberieV2 from '@/data/metiers/plomberie-v2.json';
import chauffageV3 from '@/data/metiers/chauffage-ecs-v3.json';
import placoV2 from '@/data/metiers/placo-cloisons-v2.json';
import revetementsSolV3 from '@/data/metiers/revetements-sol-v3.json';
import peintureV3 from '@/data/metiers/peinture-finitions-v3.json';

// ── Types normalisés ─────────────────────────────────

export type LoadedTask = {
  id: string; // ex. "demo_001" — référence stable côté JSON métier
  title: string;
  phaseKey: string;
  isBlocking: boolean;
  photoRequired: boolean;
};

export type LoadedPhase = {
  id: string;
  label: string;
  tasks: LoadedTask[];
};

export type LoadedTrade = {
  key: TradeKey;
  label: string;
  icon: string;
  phases: LoadedPhase[];
  totalTasks: number;
};

// ── Shape des JSON sources ──────────────────────────

type RawTask = {
  id: string;
  title: string;
  phase: string;
  pro_status?: string;
  pro_recommended?: boolean;
  blocking_justification_required?: unknown;
  photo_required_before_validation?: boolean;
};

type RawPhase = {
  id: string;
  label: string;
  tasks?: RawTask[];
};

type RawModule = {
  phases?: RawPhase[];
};

// ── Mapping TradeKey → source(s) ─────────────────────

type Source = {
  module: RawModule;
  // Filtre optionnel sur les phases : 'include' ne garde que ces phase IDs ;
  // 'exclude' garde toutes sauf celles-ci.
  filter?: { kind: 'include'; phases: string[] } | { kind: 'exclude'; phases: string[] };
};

const SOURCES: Record<TradeKey, Source[]> = {
  demolition: [{ module: demolitionV3 as RawModule }],
  gros_oeuvre: [{ module: gosV3 as RawModule }],
  charpente: [
    { module: toitureV3 as RawModule, filter: { kind: 'include', phases: ['charpente_structure'] } },
  ],
  couverture: [
    { module: toitureV3 as RawModule, filter: { kind: 'exclude', phases: ['charpente_structure'] } },
  ],
  menuiserie_ext: [
    { module: menuiseriesV3 as RawModule, filter: { kind: 'exclude', phases: ['menuiseries_interieures'] } },
  ],
  isolation: [{ module: isolationV3 as RawModule }],
  electricite: [{ module: electriciteV2 as RawModule }],
  plomberie: [
    { module: plomberieV2 as RawModule },
    { module: chauffageV3 as RawModule },
  ],
  placo: [{ module: placoV2 as RawModule }],
  menuiserie_int: [
    { module: menuiseriesV3 as RawModule, filter: { kind: 'include', phases: ['menuiseries_interieures'] } },
  ],
  revetements: [
    { module: revetementsSolV3 as RawModule },
    { module: peintureV3 as RawModule },
  ],
};

// ── Dérivation du flag is_blocking ──────────────────
// Critique = oblige un pro / une attestation / une justification pour débloquer.
// Le tag UI "critique" sur l'onboarding reflète ces deux signaux v3 (et le
// fallback pro_recommended pour les modules encore en v2).
function deriveBlocking(t: RawTask): boolean {
  if (t.pro_status === 'pro_obligatoire_blocage') return true;
  if (
    Array.isArray(t.blocking_justification_required) &&
    t.blocking_justification_required.length > 0
  ) {
    return true;
  }
  return false;
}

// ── API ─────────────────────────────────────────────

function applyFilter(phases: RawPhase[], filter?: Source['filter']): RawPhase[] {
  if (!filter) return phases;
  if (filter.kind === 'include') {
    const set = new Set(filter.phases);
    return phases.filter((p) => set.has(p.id));
  }
  const exclude = new Set(filter.phases);
  return phases.filter((p) => !exclude.has(p.id));
}

export function loadTrade(key: TradeKey): LoadedTrade {
  const meta = TRADE_LABEL_BY_KEY[key];
  const phases: LoadedPhase[] = [];
  let total = 0;

  for (const source of SOURCES[key] ?? []) {
    const raw = applyFilter(source.module.phases ?? [], source.filter);
    for (const p of raw) {
      const tasks: LoadedTask[] = (p.tasks ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        phaseKey: p.id,
        isBlocking: deriveBlocking(t),
        photoRequired: !!t.photo_required_before_validation,
      }));
      if (tasks.length === 0) continue;
      total += tasks.length;
      phases.push({ id: p.id, label: p.label, tasks });
    }
  }

  return { key, label: meta.label, icon: meta.icon, phases, totalTasks: total };
}

// Charge les 11 trades. Léger (~700 tâches × ~3 champs) — passé en prop
// du Server Component vers le Client Component d'onboarding.
export function loadAllTrades(): Record<TradeKey, LoadedTrade> {
  const out = {} as Record<TradeKey, LoadedTrade>;
  for (const key of Object.keys(SOURCES) as TradeKey[]) {
    out[key] = loadTrade(key);
  }
  return out;
}

// Recherche rapide par id pour la validation côté Server Action.
export function findTaskById(
  trade: TradeKey,
  taskId: string,
): { task: LoadedTask; phase: LoadedPhase } | null {
  const loaded = loadTrade(trade);
  for (const p of loaded.phases) {
    const t = p.tasks.find((x) => x.id === taskId);
    if (t) return { task: t, phase: p };
  }
  return null;
}
