// ─────────────────────────────────────────────────────
// Estimation de délai chantier — fonction pure.
//
// Contrat strict (cf. brief Estimation, §4) :
//  1. Pure : aucun accès DB, aucun side-effect, aucun appel réseau
//  2. Synchrone : pas de Promise, retour immédiat
//  3. Utilisable côté client (importable dans un useMemo)
//  4. Rapide : < 1ms pour ~50 tâches (vérifié par test perf)
//
// La fonction est consommée par :
//  - Le server component dashboard (encart estimation)
//  - L'écran récap fin d'onboarding (server, preview)
//  - La page /estimation (client, simulations what-if)
//  - La page /chantier/modifier (client, sticky bar temps réel) ← le + exigeant
// ─────────────────────────────────────────────────────

import { NIVEAU_COEF } from '@/lib/niveau/types';
import {
  COEF_BORNE_BASSE,
  COEF_BORNE_HAUTE,
  COEF_MARGE_CENTRALE,
  DUREE_DEFAUT_MINUTES,
  MINUTES_PAR_JOUR_TRAVAIL,
  RYTHME_JOURS_SEMAINE,
  calculerConfiance,
} from './constants';
import { getTempsSechageJours } from './temps-sechage';
import type {
  EstimationParams,
  EstimationResult,
  EstimationTache,
} from './types';

const JOURS_PAR_MOIS = 30;

// Coefficient artisan (= 1.0). Constant local pour clarté du code ;
// permettrait de l'extraire si on voulait moduler "qualité de l'artisan".
const COEF_ARTISAN = 1;

// Trie les tâches par priorité de délégation : pro_recommended d'abord, puis
// par durée décroissante (déléguer les longues en priorité). Cohérent avec
// la décision produit "le slider délégation reflète les recommandations Klaro".
function trierPourDelegation(taches: EstimationTache[]): EstimationTache[] {
  return [...taches].sort((a, b) => {
    const aPro = a.pro_recommended ? 1 : 0;
    const bPro = b.pro_recommended ? 1 : 0;
    if (aPro !== bPro) return bPro - aPro; // pro_recommended desc
    const aDuree = a.duree_reference_minutes ?? DUREE_DEFAUT_MINUTES;
    const bDuree = b.duree_reference_minutes ?? DUREE_DEFAUT_MINUTES;
    return bDuree - aDuree; // durée desc
  });
}

export function calculerEstimation(params: EstimationParams): EstimationResult {
  const { taches, niveau, rythme, tauxDelegation = 0 } = params;

  const total_taches = taches.length;
  const taches_avec_duree = taches.filter(
    (t) => typeof t.duree_reference_minutes === 'number',
  ).length;
  const taux_couverture = total_taches === 0 ? 0 : taches_avec_duree / total_taches;
  const confiance = calculerConfiance(taux_couverture);

  // Cas dégénéré : pas de tâches → retour zéros (l'UI affichera "Sélectionne
  // d'abord tes tâches"), mais la fonction reste totale.
  if (total_taches === 0) {
    return {
      total_taches: 0,
      taches_avec_duree: 0,
      taux_couverture: 0,
      confiance: 'indisponible',
      jours_travail_effectif: 0,
      delai_central_jours: 0,
      delai_central_mois: 0,
      borne_basse_jours: 0,
      borne_basse_mois: 0,
      borne_haute_jours: 0,
      borne_haute_mois: 0,
      decomposition: {
        duree_brute_jours: 0,
        sechages_jours: 0,
        duree_avec_sechages_jours: 0,
        coef_marge_centrale: COEF_MARGE_CENTRALE,
      },
    };
  }

  const coefUser = NIVEAU_COEF[niveau];
  const taux = Math.max(0, Math.min(1, tauxDelegation));
  const nbDeleguees = Math.round(total_taches * taux);

  // Identifier les tâches déléguées par tri stable. On stocke les ids dans un
  // Set pour le test d'appartenance en O(1) lors du parcours principal.
  const triees = trierPourDelegation(taches);
  const idsDeleguees = new Set<string>();
  for (let i = 0; i < nbDeleguees && i < triees.length; i++) {
    idsDeleguees.add(triees[i].id);
  }

  // Somme des durées pondérées (minutes) + somme des séchages (jours)
  let totalMinutesPondere = 0;
  let totalSechagesJours = 0;
  for (const tache of taches) {
    const dureeMin = tache.duree_reference_minutes ?? DUREE_DEFAUT_MINUTES;
    const coef = idsDeleguees.has(tache.id) ? COEF_ARTISAN : coefUser;
    totalMinutesPondere += dureeMin * coef;
    totalSechagesJours += getTempsSechageJours(tache.materiau_sechage);
  }

  // Conversion minutes → jours de travail effectif
  const jours_travail_effectif = totalMinutesPondere / MINUTES_PAR_JOUR_TRAVAIL;

  // Délai calendaire brut : jours travail rapportés au rythme hebdo, ×7
  // pour obtenir des jours calendaires
  const joursParSemaine = RYTHME_JOURS_SEMAINE[rythme];
  const duree_brute_jours =
    joursParSemaine === 0 ? 0 : (jours_travail_effectif / joursParSemaine) * 7;

  // + séchages (calendaires, additifs)
  const duree_avec_sechages_jours = duree_brute_jours + totalSechagesJours;

  // Marge centrale (imprévus normaux)
  const delai_central_jours = duree_avec_sechages_jours * COEF_MARGE_CENTRALE;

  // Fourchette (basse = chantier idéal, haute = imprévus exceptionnels)
  const borne_basse_jours = delai_central_jours * COEF_BORNE_BASSE;
  const borne_haute_jours = delai_central_jours * COEF_BORNE_HAUTE;

  return {
    total_taches,
    taches_avec_duree,
    taux_couverture,
    confiance,
    jours_travail_effectif,
    delai_central_jours,
    delai_central_mois: Math.round(delai_central_jours / JOURS_PAR_MOIS),
    borne_basse_jours,
    borne_basse_mois: Math.round(borne_basse_jours / JOURS_PAR_MOIS),
    borne_haute_jours,
    borne_haute_mois: Math.round(borne_haute_jours / JOURS_PAR_MOIS),
    decomposition: {
      duree_brute_jours,
      sechages_jours: totalSechagesJours,
      duree_avec_sechages_jours,
      coef_marge_centrale: COEF_MARGE_CENTRALE,
    },
  };
}
