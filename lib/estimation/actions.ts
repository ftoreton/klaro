'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { RYTHMES } from './constants';
import type { Rythme } from './types';

const VALID_RYTHMES = new Set<Rythme>(RYTHMES);

// Persiste un nouveau rythme sur le projet de l'user. RLS garantit que
// l'user ne peut update que ses propres projets ; on ajoute un `.eq` sur
// user_id en ceinture-bretelles.
export async function updateProjectRythme(projectId: string, rythme: Rythme): Promise<void> {
  if (!VALID_RYTHMES.has(rythme)) throw new Error('Rythme invalide.');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté.');

  const { error } = await supabase
    .from('projects')
    .update({ rythme })
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  // Le rythme impacte l'estimation affichée sur plusieurs routes.
  revalidatePath('/estimation');
  revalidatePath('/dashboard');
}
