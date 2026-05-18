import type { Rythme, ConfianceEstimation } from './types';

// ─────────────────────────────────────────────────────
// Conversion durée travail
// ─────────────────────────────────────────────────────
// Convention produit : 1 jour de travail effectif = 8 heures = 480 minutes.
// Sert à convertir `duree_reference_minutes` (seed métier) en jours.
export const HEURES_TRAVAIL_PAR_JOUR = 8;
export const MINUTES_PAR_JOUR_TRAVAIL = HEURES_TRAVAIL_PAR_JOUR * 60; // = 480

// ─────────────────────────────────────────────────────
// Rythme → jours travaillés par semaine
// ─────────────────────────────────────────────────────
export const RYTHME_JOURS_SEMAINE: Record<Rythme, number> = {
  temps_plein: 5,
  soirs_et_we: 2.5,
  we_seul: 2,
  quelques_we_mois: 0.5,
};

export const RYTHME_LABEL: Record<Rythme, { titre: string; description: string }> = {
  temps_plein: {
    titre: 'Temps plein',
    description: 'Je peux travailler ~5 jours par semaine sur mon chantier',
  },
  soirs_et_we: {
    titre: 'Soirs et week-ends',
    description: 'Je travaillerai en soirée et le week-end (~2,5 jours équivalents)',
  },
  we_seul: {
    titre: 'Week-ends uniquement',
    description: 'Je travaillerai uniquement les samedis et dimanches (~2 jours)',
  },
  quelques_we_mois: {
    titre: 'Quelques week-ends par mois',
    description: 'Je peux y consacrer 1 à 2 week-ends par mois (~0,5 jour/semaine)',
  },
};

// Ordre canonique pour l'affichage (du plus intensif au moins intensif)
export const RYTHMES: readonly Rythme[] = [
  'temps_plein',
  'soirs_et_we',
  'we_seul',
  'quelques_we_mois',
] as const;

export const RYTHME_FALLBACK: Rythme = 'soirs_et_we';

// ─────────────────────────────────────────────────────
// Marges & fourchette
// ─────────────────────────────────────────────────────
// Coefficient appliqué au délai brut (jours travail + séchages) pour obtenir
// le délai central affiché. Représente les imprévus normaux (livraisons,
// petites erreurs, replanifications).
export const COEF_MARGE_CENTRALE = 1.20;

// Coefficients appliqués au délai central pour la fourchette affichée.
//  • basse : chantier qui se passe très bien
//  • haute : imprévus exceptionnels en plus de la marge centrale
export const COEF_BORNE_BASSE = 0.85;
export const COEF_BORNE_HAUTE = 1.20;

// ─────────────────────────────────────────────────────
// Palier de confiance (taux de couverture des durées)
// ─────────────────────────────────────────────────────
// Si X% des tâches du chantier ont une durée renseignée :
//  • ≥ 80 % → estimation affichée normalement
//  • 40-80 % → estimation + disclaimer "estimation partielle, sera affinée"
//  • <  40 % → pas de chiffre, message "indisponible (calibration en cours)"
export const CONFIANCE_THRESHOLD_COMPLETE = 0.80;
export const CONFIANCE_THRESHOLD_PARTIELLE = 0.40;

export function calculerConfiance(tauxCouverture: number): ConfianceEstimation {
  if (tauxCouverture >= CONFIANCE_THRESHOLD_COMPLETE) return 'complete';
  if (tauxCouverture >= CONFIANCE_THRESHOLD_PARTIELLE) return 'partielle';
  return 'indisponible';
}

// ─────────────────────────────────────────────────────
// Durée par défaut pour tâches sans `duree_reference_minutes`
// ─────────────────────────────────────────────────────
// Conservative : 1 jour de travail. Loggué en warning dans `calculerEstimation`
// pour qu'on enrichisse les seeds manquants.
export const DUREE_DEFAUT_MINUTES = MINUTES_PAR_JOUR_TRAVAIL;
