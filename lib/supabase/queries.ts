// Helpers Supabase server-side pour le projet courant de l'utilisateur.
// À utiliser uniquement dans des Server Components ou Server Actions.

import { createClient } from '@/lib/supabase/server';
import type { ProjectRow, ProjectTaskRow, ProjectTradeRow } from '@/lib/database.types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Renvoie le projet de l'user courant (un seul pour l'instant).
// `null` si pas encore créé.
export async function getCurrentProject(): Promise<ProjectRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as ProjectRow | null) ?? null;
}

export async function getProjectTrades(projectId: string): Promise<ProjectTradeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('project_trades')
    .select('*')
    .eq('project_id', projectId);
  return (data as ProjectTradeRow[] | null) ?? [];
}

export async function getProjectTasks(projectId: string): Promise<ProjectTaskRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });
  return (data as ProjectTaskRow[] | null) ?? [];
}
