// ─────────────────────────────────────────────────────
// Pricing — stub minimal pour le module Modification du chantier.
// Définit le palier et son prix, suffisant pour la logique d'upgrade refusée
// côté server actions. Le module Pricing étendra ce fichier (Stripe checkout,
// webhooks, etc.) sans casser ce qui est exposé ici.
// ─────────────────────────────────────────────────────

export type Palier = 'palier_1_3' | 'palier_4_7' | 'palier_8_plus';

// Prix one-shot par palier (en centimes — convention pour Stripe).
export const PALIER_PRIX_CENTS: Record<Palier, number> = {
  palier_1_3: 1900,
  palier_4_7: 3900,
  palier_8_plus: 7900,
};

export const PALIER_LABEL: Record<Palier, string> = {
  palier_1_3: '1 à 3 corps de métier',
  palier_4_7: '4 à 7 corps de métier',
  palier_8_plus: '8 corps de métier et plus',
};

// Détermine le palier en fonction du nombre de corps de métier actifs.
// Le palier change à 4 (entre 3 et 4) et à 8 (entre 7 et 8).
export function getPalierForCount(count: number): Palier {
  if (count <= 3) return 'palier_1_3';
  if (count <= 7) return 'palier_4_7';
  return 'palier_8_plus';
}

// Différence à payer pour passer d'un palier à un autre (positive si upgrade).
// Utilisé par la modal d'upgrade pour afficher "+XX€".
export function getUpgradePrice(from: Palier, to: Palier): number {
  return PALIER_PRIX_CENTS[to] - PALIER_PRIX_CENTS[from];
}
