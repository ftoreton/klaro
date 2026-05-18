'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isNiveauUtilisateur, type NiveauUtilisateur } from './types';

// Upsert du niveau pour l'user courant. Utilisée à l'onboarding ET depuis
// /parametres. Une seule entrée par user (PK = user_id), donc upsert idempotent.
export async function setNiveau(niveau: NiveauUtilisateur): Promise<void> {
  if (!isNiveauUtilisateur(niveau)) {
    throw new Error('Niveau invalide.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté.');

  const { error } = await supabase
    .from('user_profile')
    .upsert(
      { user_id: user.id, niveau },
      { onConflict: 'user_id' },
    );

  if (error) throw new Error(error.message);

  // Le niveau change l'affichage de la vue métier (mode) et, à terme,
  // les durées calculées. On invalide largement.
  revalidatePath('/', 'layout');
}
