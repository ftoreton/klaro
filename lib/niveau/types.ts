// ─────────────────────────────────────────────────────
// Niveau utilisateur — auto-déclaré à l'onboarding,
// modifiable depuis /parametres. Source unique de vérité
// pour le coefficient durée et le mapping vers le mode métier.
// ─────────────────────────────────────────────────────

import type { ModeUtilisateur } from '@/lib/metier/types';

export type NiveauUtilisateur =
  | 'bricoleur_du_dimanche'
  | 'bricoleur_moyen'
  | 'bricoleur_aguerri'
  | 'artisan';

// Ordre canonique — utilisé pour les listes UI (onboarding, paramètres).
export const NIVEAUX: readonly NiveauUtilisateur[] = [
  'bricoleur_du_dimanche',
  'bricoleur_moyen',
  'bricoleur_aguerri',
  'artisan',
] as const;

// Coefficient appliqué à la durée de référence artisan.
// duree_affichee = duree_reference_artisan_minutes × NIVEAU_COEF[niveau]
export const NIVEAU_COEF: Record<NiveauUtilisateur, number> = {
  bricoleur_du_dimanche: 4,
  bricoleur_moyen: 2.25,
  bricoleur_aguerri: 1.5,
  artisan: 1,
};

// Mapping niveau → mode pour le filtre des sous-tâches en vue métier.
// bricoleur_aguerri et artisan partagent le même mode d'affichage :
// la différence entre eux est portée par le coefficient durée, pas par le contenu.
export const NIVEAU_TO_MODE: Record<NiveauUtilisateur, ModeUtilisateur> = {
  bricoleur_du_dimanche: 'debutant',
  bricoleur_moyen: 'intermediaire',
  bricoleur_aguerri: 'expert',
  artisan: 'expert',
};

// Libellés produit — utilisés dans Step3Niveau et /parametres.
export const NIVEAU_LABEL: Record<NiveauUtilisateur, { titre: string; description: string }> = {
  bricoleur_du_dimanche: {
    titre: 'Bricoleur du dimanche',
    description: 'Je débute, j’apprends au fur et à mesure',
  },
  bricoleur_moyen: {
    titre: 'Bricoleur moyen',
    description: 'J’ai déjà fait quelques petits travaux',
  },
  bricoleur_aguerri: {
    titre: 'Bricoleur aguerri',
    description: 'Je m’y connais bien, j’ai déjà géré des chantiers',
  },
  artisan: {
    titre: 'Artisan',
    description: 'Je suis un professionnel du métier',
  },
};

// Fallback pour comptes legacy sans ligne user_profile.
// Affiche le contenu en mode intermédiaire en attendant que l'user
// renseigne son niveau via /parametres?onboarding=true.
export const NIVEAU_FALLBACK: NiveauUtilisateur = 'bricoleur_moyen';

// Garde-fou runtime — utile côté server action pour valider l'input.
export function isNiveauUtilisateur(value: unknown): value is NiveauUtilisateur {
  return typeof value === 'string' && (NIVEAUX as readonly string[]).includes(value);
}
