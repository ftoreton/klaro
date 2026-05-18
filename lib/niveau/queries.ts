// Helpers Supabase server-side pour le niveau de l'utilisateur courant.
// À utiliser uniquement dans des Server Components ou Server Actions.

import { createClient } from '@/lib/supabase/server';
import type { UserProfileRow } from '@/lib/database.types';
import type { NiveauUtilisateur } from './types';
import { NIVEAU_FALLBACK, NIVEAU_TO_MODE } from './types';
import type { ModeUtilisateur } from '@/lib/metier/types';

// Renvoie la ligne user_profile de l'user courant, ou null si pas encore créée
// (compte legacy ou onboarding pas terminé).
export async function getCurrentUserProfile(): Promise<UserProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (data as UserProfileRow | null) ?? null;
}

// Renvoie le niveau brut. null = pas encore défini (à gérer côté appelant :
// fallback bricoleur_moyen + redirect /parametres?onboarding=true).
export async function getCurrentNiveau(): Promise<NiveauUtilisateur | null> {
  const profile = await getCurrentUserProfile();
  return profile?.niveau ?? null;
}

// Variante "safe" qui ne renvoie jamais null : applique le fallback pour
// la vue métier (qui doit toujours avoir un mode à appliquer).
export async function getCurrentNiveauOrFallback(): Promise<NiveauUtilisateur> {
  return (await getCurrentNiveau()) ?? NIVEAU_FALLBACK;
}

// Helper pratique : niveau → mode métier, déjà avec fallback.
export async function getCurrentMode(): Promise<ModeUtilisateur> {
  return NIVEAU_TO_MODE[await getCurrentNiveauOrFallback()];
}
