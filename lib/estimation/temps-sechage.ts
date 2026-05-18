// ─────────────────────────────────────────────────────
// Temps de séchage par matériau (jours calendaires)
// ─────────────────────────────────────────────────────
// Référencé via le champ `materiau_sechage` des tâches métier.
// Les temps de séchage sont calendaires (additifs au délai), pas du
// temps de travail effectif — pendant le séchage l'user attend, il ne
// peut pas avancer sur la tâche concernée.
//
// Sources : recommandations DTU + retour de chantiers.

export const TEMPS_SECHAGE_JOURS: Record<string, number> = {
  // Maçonnerie / sols
  chape_traditionnelle: 28,
  chape_liquide: 7,
  ciment: 2,
  mortier: 1,

  // Cloisons / murs
  placo_enduit: 1,
  enduit_lissage: 2,
  enduit_facade: 2,

  // Peinture
  peinture_sous_couche: 0.5,
  peinture_finition: 0.5,
  vernis: 1,
  lasure: 1,

  // Revêtements
  colle_carrelage: 1,
  joint_carrelage: 1,
  parquet_colle: 2,

  // Autres
  silicone: 0.5,
};

// Helper : retourne le temps de séchage pour une clé, ou 0 si non trouvée.
// Renvoyer 0 (plutôt que throw) permet de tolérer des clés non-encore
// référencées dans les seeds sans casser le calcul.
export function getTempsSechageJours(materiau?: string): number {
  if (!materiau) return 0;
  return TEMPS_SECHAGE_JOURS[materiau] ?? 0;
}
