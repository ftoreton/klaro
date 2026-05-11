// Métadonnées d'onboarding (UI uniquement).
// La source de vérité des tâches métier vit dans `data/metiers/*.json` ;
// elle est chargée via `lib/onboarding/loader.ts`.

export type ProjectType =
  | 'renovation_totale'
  | 'renovation_partielle'
  | 'extension'
  | 'construction_neuve';

export type TradeKey =
  | 'demolition'
  | 'gros_oeuvre'
  | 'charpente'
  | 'couverture'
  | 'menuiserie_ext'
  | 'isolation'
  | 'electricite'
  | 'plomberie'
  | 'placo'
  | 'menuiserie_int'
  | 'revetements';

// Catalogue des 11 trades de l'onboarding. Affichage uniquement.
export const TRADES_META: { key: TradeKey; label: string; icon: string }[] = [
  { key: 'demolition', label: 'Démolition', icon: '🔨' },
  { key: 'gros_oeuvre', label: 'Gros œuvre', icon: '🧱' },
  { key: 'charpente', label: 'Charpente', icon: '🏠' },
  { key: 'couverture', label: 'Couverture', icon: '🏘️' },
  { key: 'menuiserie_ext', label: 'Menuiseries ext.', icon: '🪟' },
  { key: 'isolation', label: 'Isolation', icon: '🧊' },
  { key: 'electricite', label: 'Électricité', icon: '⚡' },
  { key: 'plomberie', label: 'Plomberie / Chauffage', icon: '🚰' },
  { key: 'placo', label: 'Placo / Cloisons', icon: '📐' },
  { key: 'menuiserie_int', label: 'Menuiseries int.', icon: '🚪' },
  { key: 'revetements', label: 'Revêtements', icon: '🎨' },
];

export const TRADE_LABEL_BY_KEY: Record<TradeKey, { label: string; icon: string }> = TRADES_META.reduce(
  (acc, t) => {
    acc[t.key] = { label: t.label, icon: t.icon };
    return acc;
  },
  {} as Record<TradeKey, { label: string; icon: string }>,
);

// Présélection des métiers selon le type de projet.
export const TRADES_BY_PROJECT_TYPE: Record<ProjectType, TradeKey[]> = {
  renovation_totale: TRADES_META.map((t) => t.key),
  renovation_partielle: ['electricite', 'plomberie', 'placo', 'menuiserie_int', 'revetements'],
  extension: [
    'gros_oeuvre',
    'charpente',
    'couverture',
    'isolation',
    'electricite',
    'plomberie',
    'placo',
    'revetements',
  ],
  construction_neuve: TRADES_META.map((t) => t.key),
};

export const PROJECT_TYPES: { key: ProjectType; label: string; sub: string; icon: string }[] = [
  {
    key: 'renovation_totale',
    label: 'Rénovation totale',
    sub: 'Maison ou appartement à reprendre de fond en comble',
    icon: '🏚️',
  },
  {
    key: 'renovation_partielle',
    label: 'Rénovation partielle',
    sub: 'Une ou plusieurs pièces, sans toucher à la structure',
    icon: '🛠️',
  },
  {
    key: 'extension',
    label: 'Extension',
    sub: 'Agrandissement, surélévation, véranda',
    icon: '➕',
  },
  {
    key: 'construction_neuve',
    label: 'Construction neuve',
    sub: 'Maison neuve à bâtir de zéro',
    icon: '🏗️',
  },
];

export const BUDGET_RANGES: { key: string; label: string }[] = [
  { key: 'lt_20k', label: 'Moins de 20 000 €' },
  { key: '20_50k', label: '20 000 – 50 000 €' },
  { key: '50_100k', label: '50 000 – 100 000 €' },
  { key: 'gt_100k', label: 'Plus de 100 000 €' },
];

export const DURATION_RANGES: { key: string; label: string }[] = [
  { key: 'lt_3m', label: 'Moins de 3 mois' },
  { key: '3_6m', label: '3 à 6 mois' },
  { key: '6_12m', label: '6 à 12 mois' },
  { key: 'gt_12m', label: 'Plus de 12 mois' },
];
