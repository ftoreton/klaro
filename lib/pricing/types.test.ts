import { describe, expect, it } from 'vitest';
import {
  PALIER_PRIX_CENTS,
  getPalierForCount,
  getUpgradePrice,
} from './types';

describe('getPalierForCount — frontières des paliers', () => {
  it('0 métier → palier_1_3 (cas projet vide)', () => {
    expect(getPalierForCount(0)).toBe('palier_1_3');
  });

  it('1 à 3 métiers → palier_1_3', () => {
    expect(getPalierForCount(1)).toBe('palier_1_3');
    expect(getPalierForCount(2)).toBe('palier_1_3');
    expect(getPalierForCount(3)).toBe('palier_1_3');
  });

  it('4 à 7 métiers → palier_4_7', () => {
    expect(getPalierForCount(4)).toBe('palier_4_7');
    expect(getPalierForCount(5)).toBe('palier_4_7');
    expect(getPalierForCount(7)).toBe('palier_4_7');
  });

  it('8 métiers et + → palier_8_plus', () => {
    expect(getPalierForCount(8)).toBe('palier_8_plus');
    expect(getPalierForCount(11)).toBe('palier_8_plus');
    expect(getPalierForCount(100)).toBe('palier_8_plus');
  });
});

describe('getUpgradePrice — différentiel cents', () => {
  it('1-3 → 4-7 : différence 20€ (2000 cents)', () => {
    expect(getUpgradePrice('palier_1_3', 'palier_4_7')).toBe(2000);
  });

  it('4-7 → 8+ : différence 40€ (4000 cents)', () => {
    expect(getUpgradePrice('palier_4_7', 'palier_8_plus')).toBe(4000);
  });

  it('1-3 → 8+ (skip de palier) : différence 60€', () => {
    expect(getUpgradePrice('palier_1_3', 'palier_8_plus')).toBe(6000);
  });

  it('downgrade renvoie une valeur négative (utile pour détecter des cas absurdes)', () => {
    expect(getUpgradePrice('palier_8_plus', 'palier_1_3')).toBe(-6000);
  });
});

describe('PALIER_PRIX_CENTS — valeurs absolues', () => {
  it('correspond aux décisions produit (19€ / 39€ / 79€)', () => {
    expect(PALIER_PRIX_CENTS.palier_1_3).toBe(1900);
    expect(PALIER_PRIX_CENTS.palier_4_7).toBe(3900);
    expect(PALIER_PRIX_CENTS.palier_8_plus).toBe(7900);
  });
});
