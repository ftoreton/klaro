'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TRADES_META, type ProjectType, type TradeKey } from '@/data/onboarding/trades';
import { loadTrade } from '@/lib/onboarding/loader';

export type CreateProjectInput = {
  name: string;
  type: ProjectType;
  surface: number | null;
  budget_range: string | null;
  start_date: string | null; // YYYY-MM-DD
  duration_range: string | null;
  trades: TradeKey[];
  // {tradeKey: [taskId, ...]} — IDs sources des tâches sélectionnées.
  selected_task_ids: Record<TradeKey, string[]>;
};

const VALID_TRADES = new Set<TradeKey>(TRADES_META.map((t) => t.key));
const VALID_TYPES = new Set<ProjectType>([
  'renovation_totale',
  'renovation_partielle',
  'extension',
  'construction_neuve',
]);

export async function createProjectFromOnboarding(input: CreateProjectInput) {
  if (!input.name?.trim()) throw new Error('Nom de chantier requis.');
  if (!VALID_TYPES.has(input.type)) throw new Error('Type de projet invalide.');
  const trades = input.trades.filter((k) => VALID_TRADES.has(k));
  if (trades.length === 0) throw new Error('Au moins un corps de métier requis.');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté.');

  // 1. INSERT projet
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: input.name.trim().slice(0, 120),
      type: input.type,
      surface: input.surface ?? null,
      budget_range: input.budget_range ?? null,
      start_date: input.start_date ?? null,
      duration_range: input.duration_range ?? null,
    })
    .select('id')
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? 'Création du projet échouée.');
  }

  // 2. Bulk INSERT trades
  const tradeRows = trades.map((trade_key) => ({ project_id: project.id, trade_key }));
  const { error: tradesError } = await supabase.from('project_trades').insert(tradeRows);
  if (tradesError) throw new Error(tradesError.message);

  // 3. Bulk INSERT tasks — résolues depuis le loader (source de vérité).
  // L'ordre = ordre des phases dans le JSON métier → préserve la chronologie
  // chantier (diagnostic d'abord, contrôle en dernier).
  const taskRows: {
    project_id: string;
    trade_key: TradeKey;
    phase_key: string;
    template_task_id: string;
    label: string;
    is_blocking: boolean;
    position: number;
  }[] = [];

  let pos = 0;
  for (const tradeKey of trades) {
    const loaded = loadTrade(tradeKey);
    const selected = new Set(input.selected_task_ids[tradeKey] ?? []);
    for (const phase of loaded.phases) {
      for (const task of phase.tasks) {
        if (!selected.has(task.id)) continue;
        taskRows.push({
          project_id: project.id,
          trade_key: tradeKey,
          phase_key: phase.id,
          template_task_id: task.id,
          label: task.title,
          is_blocking: task.isBlocking,
          position: pos++,
        });
      }
    }
  }

  if (taskRows.length > 0) {
    const { error: tasksError } = await supabase.from('project_tasks').insert(taskRows);
    if (tasksError) throw new Error(tasksError.message);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function toggleTaskStatus(taskId: string, nextStatus: 'todo' | 'done') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté.');

  const { error } = await supabase
    .from('project_tasks')
    .update({
      status: nextStatus,
      done_at: nextStatus === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', taskId);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
}
