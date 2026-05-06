// ─────────────────────────────────────────────────────
// Contrat de données — vue hiérarchisée par corps de métier
// Respecte le brief à la lettre. Sera utilisé côté back.
// ─────────────────────────────────────────────────────

export type StatutEtape = 'todo' | 'in_progress' | 'done';
export type NiveauCriticite = 'normal' | 'important' | 'critique';
export type NiveauSousTache = 'debutant' | 'intermediaire' | 'expert';
export type ModeUtilisateur = 'debutant' | 'intermediaire' | 'expert';

export interface Photo {
  id: string;
  url: string;
  uploaded_at: string;
  caption?: string;
}

export interface SousTache {
  id: string;
  label: string;
  done: boolean;
  niveau: NiveauSousTache;
}

export interface TermeTechnique {
  terme: string;
  definition_simple: string;
}

export interface Etape {
  id: string;
  titre_simple: string;
  titre_technique: string;
  resume_simple: string;
  pourquoi_important: string;
  niveau_criticite: NiveauCriticite;
  statut: StatutEtape;
  date_planifiee: string | null;
  photos: Photo[];
  sous_taches: SousTache[];
  erreurs_frequentes: string[];
  recommandations_simples: string[];
  recommandations_techniques_DTU: string[];
  termes_techniques: TermeTechnique[];
  materiel_conseille?: string[];
}

export interface Metier {
  id: string;
  nom: string;
  description_simple: string;
  etapes: Etape[];
}
