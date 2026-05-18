'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { TRADES_META, type TradeKey } from '@/data/onboarding/trades';
import { findTaskById } from '@/lib/onboarding/loader';
import { getPalierForCount, getUpgradePrice, type Palier } from '@/lib/pricing/types';
import type { SupabaseClient, User } from '@supabase/supabase-js';

const VALID_TRADES = new Set<TradeKey>(TRADES_META.map((t) => t.key));

// ─────────────────────────────────────────────────────
// Outcomes : pour les actions qui peuvent légitimement échouer sans throw
// (ex. upgrade requis pour addTrade, tâches actives bloquent removeTrade).
// On préfère ces types discriminés au throw pour que la couche client puisse
// matcher l'outcome et router vers la bonne UI (toast vs modal).
// ─────────────────────────────────────────────────────

export type AddTradeOutcome =
  | { kind: 'added' }
  | {
      kind: 'upgrade_required';
      fromPalier: Palier;
      toPalier: Palier;
      diffCents: number;
    };

export type RemoveTradeOutcome =
  | { kind: 'removed' }
  | { kind: 'has_active_tasks'; taskLabels: string[] };

// ─────────────────────────────────────────────────────
// Helpers internes (pas exportés — pas une server action publique)
// ─────────────────────────────────────────────────────

async function requireAuth(): Promise<{ supabase: SupabaseClient; user: User }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté.');
  return { supabase, user };
}

// Vérifie l'appartenance du projet à l'user. RLS le garantit déjà, mais on
// renvoie une erreur claire si l'id ne correspond pas (404 produit, pas 500).
async function assertProjectOwned(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
): Promise<void> {
  const { data } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) throw new Error('Projet introuvable.');
}

function invalidatePages(): void {
  revalidatePath('/chantier/modifier');
  revalidatePath('/dashboard');
  revalidatePath('/estimation');
}

// ─────────────────────────────────────────────────────
// addTaskToProject : ajoute une tâche du référentiel à un projet.
// `templateTaskId` est l'id stable du JSON métier (ex. "elec_001").
// Refuse si le métier n'est pas actif sur le projet, ou si la tâche est déjà ajoutée.
// ─────────────────────────────────────────────────────

export async function addTaskToProject(
  projectId: string,
  templateTaskId: string,
  tradeKey: TradeKey,
): Promise<void> {
  if (!VALID_TRADES.has(tradeKey)) throw new Error('Métier invalide.');
  const { supabase, user } = await requireAuth();
  await assertProjectOwned(supabase, projectId, user.id);

  // Vérifier que le métier est bien actif sur le projet
  const { data: trade } = await supabase
    .from('project_trades')
    .select('trade_key')
    .eq('project_id', projectId)
    .eq('trade_key', tradeKey)
    .maybeSingle();
  if (!trade) {
    throw new Error('Ce métier n’est pas actif sur le chantier. Ajoute-le d’abord.');
  }

  // Vérifier que la tâche n'est pas déjà ajoutée
  const { data: existing } = await supabase
    .from('project_tasks')
    .select('id')
    .eq('project_id', projectId)
    .eq('template_task_id', templateTaskId)
    .maybeSingle();
  if (existing) throw new Error('Cette tâche est déjà ajoutée.');

  // Récupérer la tâche depuis le référentiel pour le label, le flag is_blocking et le phase_key
  const found = findTaskById(tradeKey, templateTaskId);
  if (!found) throw new Error('Tâche introuvable dans le référentiel métier.');

  // Position = max + 1 (préserve l'ordre chronologique des tâches existantes)
  const { data: lastRow } = await supabase
    .from('project_tasks')
    .select('position')
    .eq('project_id', projectId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (lastRow?.position ?? -1) + 1;

  const { error } = await supabase.from('project_tasks').insert({
    project_id: projectId,
    trade_key: tradeKey,
    phase_key: found.phase.id,
    template_task_id: templateTaskId,
    label: found.task.title,
    is_blocking: found.task.isBlocking,
    position: nextPosition,
  });
  if (error) throw new Error(error.message);

  invalidatePages();
}

// ─────────────────────────────────────────────────────
// removeTaskFromProject : supprime une tâche du projet.
// `taskRowId` est l'UUID de la ligne project_tasks (pas le template_task_id).
// Refuse si la tâche est en cours ou terminée — l'user doit d'abord la
// remettre à "todo" via le dashboard (ou attendre la V2 qui gérera mieux ce cas).
// ─────────────────────────────────────────────────────

export async function removeTaskFromProject(taskRowId: string): Promise<void> {
  const { supabase, user } = await requireAuth();

  // Récupère la tâche + vérifie l'ownership via join sur projects
  const { data: row } = await supabase
    .from('project_tasks')
    .select('id, project_id, status, projects!inner(user_id)')
    .eq('id', taskRowId)
    .maybeSingle();
  if (!row) throw new Error('Tâche introuvable.');

  // RLS garantit déjà l'isolation, mais on double-check explicitement
  // (le join n'ajoute une garantie qu'au niveau SQL ; la ligne n'arriverait
  // pas ici si l'user n'en était pas propriétaire).
  const project = row.projects as unknown as { user_id: string };
  if (project.user_id !== user.id) throw new Error('Non autorisé.');

  if (row.status !== 'todo') {
    throw new Error(
      'Cette tâche est en cours ou terminée. Elle ne peut pas être retirée — repasse-la en "à faire" depuis le dashboard d’abord.',
    );
  }

  const { error } = await supabase.from('project_tasks').delete().eq('id', taskRowId);
  if (error) throw new Error(error.message);

  invalidatePages();
}

// ─────────────────────────────────────────────────────
// addTradeToProject : ajoute un corps de métier au projet.
// Décision produit (b) : le métier est ajouté SANS ses tâches. L'user choisit
// ensuite quelles tâches via l'UI normale d'ajout.
//
// Vérifie d'abord si l'ajout fait changer de palier. Si oui, REFUSE et renvoie
// l'info d'upgrade pour que le client affiche la modal. La vraie ajout
// post-paiement passera par `addTradeAfterPayment` (à créer dans le module
// Pricing, non implémenté ici).
// ─────────────────────────────────────────────────────

export async function addTradeToProject(
  projectId: string,
  tradeKey: TradeKey,
): Promise<AddTradeOutcome> {
  if (!VALID_TRADES.has(tradeKey)) throw new Error('Métier invalide.');
  const { supabase, user } = await requireAuth();
  await assertProjectOwned(supabase, projectId, user.id);

  // Vérifier que le métier n'est pas déjà actif
  const { data: existing } = await supabase
    .from('project_trades')
    .select('trade_key')
    .eq('project_id', projectId)
    .eq('trade_key', tradeKey)
    .maybeSingle();
  if (existing) throw new Error('Ce métier est déjà actif.');

  // Calculer l'impact sur le palier
  const { count } = await supabase
    .from('project_trades')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);
  const currentCount = count ?? 0;
  const currentPalier = getPalierForCount(currentCount);
  const newPalier = getPalierForCount(currentCount + 1);

  if (newPalier !== currentPalier) {
    // Upgrade requis : on NE FAIT PAS l'insert. Le client recevra l'info
    // et affichera la modal de paiement. L'ajout réel passera par
    // addTradeAfterPayment(projectId, tradeKey, paymentId) une fois le
    // module Pricing en place.
    return {
      kind: 'upgrade_required',
      fromPalier: currentPalier,
      toPalier: newPalier,
      diffCents: getUpgradePrice(currentPalier, newPalier),
    };
  }

  // Insert dans la même tranche → autorisé sans paiement
  const { error } = await supabase
    .from('project_trades')
    .insert({ project_id: projectId, trade_key: tradeKey });
  if (error) throw new Error(error.message);

  invalidatePages();
  return { kind: 'added' };
}

// ─────────────────────────────────────────────────────
// removeTradeFromProject : retire un corps de métier.
// Refuse si des tâches actives existent (renvoie leurs labels pour que l'UI
// puisse les lister). Le palier payé reste inchangé (pas de remboursement
// automatique — c'est l'engagement du user au moment de l'achat).
// ─────────────────────────────────────────────────────

export async function removeTradeFromProject(
  projectId: string,
  tradeKey: TradeKey,
): Promise<RemoveTradeOutcome> {
  if (!VALID_TRADES.has(tradeKey)) throw new Error('Métier invalide.');
  const { supabase, user } = await requireAuth();
  await assertProjectOwned(supabase, projectId, user.id);

  // Vérifier qu'aucune tâche n'existe pour ce métier sur ce projet
  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('label')
    .eq('project_id', projectId)
    .eq('trade_key', tradeKey);
  if (tasks && tasks.length > 0) {
    return {
      kind: 'has_active_tasks',
      taskLabels: tasks.map((t) => t.label),
    };
  }

  const { error } = await supabase
    .from('project_trades')
    .delete()
    .eq('project_id', projectId)
    .eq('trade_key', tradeKey);
  if (error) throw new Error(error.message);

  invalidatePages();
  return { kind: 'removed' };
}
