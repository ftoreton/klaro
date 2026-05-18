// ─────────────────────────────────────────────────────
// Estimation de délai chantier — contrat de données.
// Toutes les durées internes sont en MINUTES (cohérent avec
// le seed métier `duree_reference_minutes`), converties en
// jours via HEURES_TRAVAIL_PAR_JOUR au moment du calcul.
// ─────────────────────────────────────────────────────

export type Rythme =
  | 'temps_plein'
  | 'soirs_et_we'
  | 'we_seul'
  | 'quelques_we_mois';

// Tâche minimaliste consommée par `calculerEstimation`.
// Ne dépend pas du schéma DB ni du loader — composé par l'appelant.
export interface EstimationTache {
  id: string;
  // Durée artisan (coef ×1) en minutes. Optionnelle : si absente, valeur
  // par défaut conservative appliquée et la tâche est marquée non-couverte
  // pour le palier de confiance.
  duree_reference_minutes?: number;
  // Clé optionnelle dans TEMPS_SECHAGE_JOURS — déclenche un temps de séchage
  // incompressible (calendaire, non additif au temps de travail).
  materiau_sechage?: string;
  // Présent dans les seeds métier. Sert au slider "taux de délégation" pour
  // prioriser la délégation : les tâches recommandées pro sont déléguées
  // en premier.
  pro_recommended?: boolean;
}

// Niveau de confiance dans l'estimation, dérivé du taux de couverture
// (% de tâches avec duree_reference_minutes renseignée).
//  • complete    : ≥ 80 % → estimation affichée normalement
//  • partielle   : 40-80 % → estimation affichée + disclaimer
//  • indisponible : <  40 % → pas de chiffre, message "calibration en cours"
export type ConfianceEstimation = 'complete' | 'partielle' | 'indisponible';

export interface EstimationParams {
  taches: EstimationTache[];
  // Détermine le coefficient appliqué aux tâches faites par l'user.
  // Importé depuis `lib/niveau/types` (NIVEAU_COEF).
  niveau: import('@/lib/niveau/types').NiveauUtilisateur;
  rythme: Rythme;
  // Taux de délégation 0..1 (0 = l'user fait tout, 1 = tout délégué artisan).
  // Default 0. Les tâches sont triées par `pro_recommended` puis par durée
  // décroissante pour déterminer lesquelles sont déléguées.
  tauxDelegation?: number;
}

export interface EstimationDecomposition {
  // Avant ajout des séchages et de la marge
  duree_brute_jours: number;
  // Total des temps de séchage rencontrés (calendaire, non additif au travail)
  sechages_jours: number;
  // Délai après ajout des séchages, avant marge
  duree_avec_sechages_jours: number;
  // Coefficient multiplicateur appliqué pour la marge centrale (1.20)
  coef_marge_centrale: number;
}

export interface EstimationResult {
  // ── Stats sur les inputs ─────────────────────────────
  total_taches: number;
  taches_avec_duree: number;
  taux_couverture: number; // 0..1
  confiance: ConfianceEstimation;

  // ── Sortie principale ───────────────────────────────
  // Jours de travail effectif (somme pondérée des durées, après application
  // du coef niveau et du taux de délégation). Indépendant du rythme.
  jours_travail_effectif: number;

  // Délai calendaire central (mois affiché en gros dans l'UI)
  delai_central_jours: number;
  delai_central_mois: number;

  // Fourchette honnête (mois affichés en sous-titre)
  borne_basse_jours: number;
  borne_basse_mois: number;
  borne_haute_jours: number;
  borne_haute_mois: number;

  // ── Décomposition (bloc "détail" collapsible) ──────
  decomposition: EstimationDecomposition;
}
