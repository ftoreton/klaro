import { describe, expect, it } from 'vitest';
import { calculerEstimation } from './calculate';
import {
  COEF_BORNE_BASSE,
  COEF_BORNE_HAUTE,
  COEF_MARGE_CENTRALE,
  DUREE_DEFAUT_MINUTES,
  MINUTES_PAR_JOUR_TRAVAIL,
} from './constants';
import type { EstimationTache } from './types';

// Helper : crée une tâche minimale pour les tests
function t(
  id: string,
  duree?: number,
  opts?: { sechage?: string; pro?: boolean },
): EstimationTache {
  return {
    id,
    duree_reference_minutes: duree,
    materiau_sechage: opts?.sechage,
    pro_recommended: opts?.pro,
  };
}

describe('calculerEstimation — cas dégénérés', () => {
  it('retourne tout à zéro pour une liste vide', () => {
    const r = calculerEstimation({
      taches: [],
      niveau: 'bricoleur_moyen',
      rythme: 'soirs_et_we',
    });
    expect(r.total_taches).toBe(0);
    expect(r.jours_travail_effectif).toBe(0);
    expect(r.delai_central_jours).toBe(0);
    expect(r.delai_central_mois).toBe(0);
    expect(r.confiance).toBe('indisponible');
  });

  it('marque indisponible si <40% des tâches ont une durée', () => {
    const taches = [
      t('a', 60),
      t('b'),
      t('c'),
      t('d'),
      t('e'),
    ]; // 1/5 = 20%
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_moyen',
      rythme: 'soirs_et_we',
    });
    expect(r.taux_couverture).toBe(0.2);
    expect(r.confiance).toBe('indisponible');
  });

  it('marque partielle entre 40% et 80%', () => {
    const taches = [t('a', 60), t('b', 60), t('c', 60), t('d'), t('e')]; // 3/5 = 60%
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_moyen',
      rythme: 'soirs_et_we',
    });
    expect(r.taux_couverture).toBe(0.6);
    expect(r.confiance).toBe('partielle');
  });

  it('marque complete si ≥80%', () => {
    const taches = [
      t('a', 60), t('b', 60), t('c', 60), t('d', 60), t('e'),
    ]; // 4/5 = 80%
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_moyen',
      rythme: 'soirs_et_we',
    });
    expect(r.confiance).toBe('complete');
  });
});

describe('calculerEstimation — conversion durées', () => {
  it('artisan @ temps_plein : 480 min = 1 jour travail = 1 jour calendaire × 7/5 × 1.20', () => {
    const taches = [t('a', MINUTES_PAR_JOUR_TRAVAIL)]; // 480 min = 1j travail
    const r = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
    });
    expect(r.jours_travail_effectif).toBe(1);
    // delai_brut = (1 / 5) × 7 = 1.4 jours
    expect(r.decomposition.duree_brute_jours).toBeCloseTo(1.4, 5);
    // pas de séchage
    expect(r.decomposition.sechages_jours).toBe(0);
    // delai_central = 1.4 × 1.20 = 1.68
    expect(r.delai_central_jours).toBeCloseTo(1.68, 5);
  });

  it('applique le coef niveau aux tâches faites par l\'user', () => {
    const taches = [t('a', 480)]; // 1 jour artisan
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_du_dimanche', // coef ×4
      rythme: 'temps_plein',
    });
    // 1j × 4 = 4j travail
    expect(r.jours_travail_effectif).toBe(4);
  });

  it('applique la valeur par défaut si duree_reference_minutes absent', () => {
    const taches = [t('a')]; // pas de durée
    const r = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
    });
    expect(r.jours_travail_effectif).toBe(DUREE_DEFAUT_MINUTES / MINUTES_PAR_JOUR_TRAVAIL);
  });
});

describe('calculerEstimation — séchages', () => {
  it('ajoute les jours de séchage au délai calendaire', () => {
    const taches = [t('a', 480, { sechage: 'chape_traditionnelle' })]; // 28j séchage
    const r = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
    });
    expect(r.decomposition.sechages_jours).toBe(28);
    // brut = 1.4j, +28j séchage = 29.4j, ×1.20 marge = 35.28j
    expect(r.delai_central_jours).toBeCloseTo(35.28, 5);
  });

  it('ignore les clés de séchage inconnues', () => {
    const taches = [t('a', 480, { sechage: 'cle_inexistante' })];
    const r = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
    });
    expect(r.decomposition.sechages_jours).toBe(0);
  });
});

describe('calculerEstimation — formule marge et fourchette', () => {
  it('central = brut × 1.20 (marge centrale)', () => {
    const taches = [t('a', 480)];
    const r = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
    });
    expect(r.delai_central_jours).toBeCloseTo(
      r.decomposition.duree_avec_sechages_jours * COEF_MARGE_CENTRALE,
      5,
    );
  });

  it('borne_basse = central × 0.85, borne_haute = central × 1.20', () => {
    const taches = [t('a', 480)];
    const r = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
    });
    expect(r.borne_basse_jours).toBeCloseTo(r.delai_central_jours * COEF_BORNE_BASSE, 5);
    expect(r.borne_haute_jours).toBeCloseTo(r.delai_central_jours * COEF_BORNE_HAUTE, 5);
  });
});

describe('calculerEstimation — rythme', () => {
  it('plus le rythme est lent, plus le délai calendaire est long', () => {
    const taches = [t('a', 4800)]; // 10j travail
    const rTpsPlein = calculerEstimation({ taches, niveau: 'artisan', rythme: 'temps_plein' });
    const rSoirsWe = calculerEstimation({ taches, niveau: 'artisan', rythme: 'soirs_et_we' });
    const rWeSeul = calculerEstimation({ taches, niveau: 'artisan', rythme: 'we_seul' });
    expect(rSoirsWe.delai_central_jours).toBeGreaterThan(rTpsPlein.delai_central_jours);
    expect(rWeSeul.delai_central_jours).toBeGreaterThan(rSoirsWe.delai_central_jours);
  });
});

describe('calculerEstimation — délégation', () => {
  it('0% délégation : toutes les tâches au coef niveau', () => {
    const taches = [t('a', 480), t('b', 480)];
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_du_dimanche', // coef ×4
      rythme: 'temps_plein',
      tauxDelegation: 0,
    });
    expect(r.jours_travail_effectif).toBe(8); // 2j × 4
  });

  it('100% délégation : toutes les tâches au coef artisan ×1', () => {
    const taches = [t('a', 480), t('b', 480)];
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_du_dimanche',
      rythme: 'temps_plein',
      tauxDelegation: 1,
    });
    expect(r.jours_travail_effectif).toBe(2); // 2j × 1
  });

  it('50% délégation : moitié coef niveau, moitié artisan', () => {
    const taches = [t('a', 480), t('b', 480)]; // 1 sera déléguée
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_du_dimanche', // ×4
      rythme: 'temps_plein',
      tauxDelegation: 0.5,
    });
    // 1 tâche artisan (×1 = 1j) + 1 tâche user (×4 = 4j) = 5j
    expect(r.jours_travail_effectif).toBe(5);
  });

  it('priorise la délégation des tâches pro_recommended=true', () => {
    const taches = [
      t('safe', 480, { pro: false }),
      t('elec_tableau', 480, { pro: true }),
    ];
    const r = calculerEstimation({
      taches,
      niveau: 'bricoleur_du_dimanche', // ×4
      rythme: 'temps_plein',
      tauxDelegation: 0.5, // 1 tâche déléguée → doit être elec_tableau
    });
    // safe est faite par l'user (×4 = 4j), elec_tableau déléguée (×1 = 1j)
    expect(r.jours_travail_effectif).toBe(5);
  });

  it('clamp le tauxDelegation entre 0 et 1', () => {
    const taches = [t('a', 480), t('b', 480)];
    const haut = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
      tauxDelegation: 2, // hors-bornes
    });
    const normal = calculerEstimation({
      taches,
      niveau: 'artisan',
      rythme: 'temps_plein',
      tauxDelegation: 1,
    });
    expect(haut.jours_travail_effectif).toBe(normal.jours_travail_effectif);
  });
});

describe('calculerEstimation — performance', () => {
  it('< 1 ms pour 50 tâches (contrainte sticky bar /chantier/modifier)', () => {
    const taches: EstimationTache[] = [];
    for (let i = 0; i < 50; i++) {
      taches.push({
        id: `t_${i}`,
        duree_reference_minutes: 60 + (i % 10) * 30,
        materiau_sechage: i % 7 === 0 ? 'placo_enduit' : undefined,
        pro_recommended: i % 3 === 0,
      });
    }

    // Warm-up pour amortir le JIT et la première lecture des constantes.
    for (let i = 0; i < 3; i++) {
      calculerEstimation({
        taches,
        niveau: 'bricoleur_moyen',
        rythme: 'soirs_et_we',
        tauxDelegation: 0.3,
      });
    }

    // Mesure : médiane sur 20 itérations pour stabiliser
    const durations: number[] = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      calculerEstimation({
        taches,
        niveau: 'bricoleur_moyen',
        rythme: 'soirs_et_we',
        tauxDelegation: 0.3,
      });
      durations.push(performance.now() - t0);
    }
    durations.sort((a, b) => a - b);
    const mediane = durations[Math.floor(durations.length / 2)];
    expect(mediane).toBeLessThan(1);
  });
});
