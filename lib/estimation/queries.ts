// Helpers Supabase server-side pour le module Estimation.
// La fonction de calcul `calculerEstimation` reste pure ; ici on assemble
// les inputs (project tasks DB + métadonnées du loader).

import { createClient } from '@/lib/supabase/server';
import { loadTrade } from '@/lib/onboarding/loader';
import type { LoadedTrade } from '@/lib/onboarding/loader';
import type { ProjectTaskRow } from '@/lib/database.types';
import type { TradeKey } from '@/data/onboarding/trades';
import type { EstimationTache } from './types';

// Joint les ProjectTaskRow avec les métadonnées métier (durée, séchage,
// pro_recommended) du loader pour produire des EstimationTache prêtes à
// consommer par `calculerEstimation`.
//
// `template_task_id` est la clé d'inférence : elle pointe vers la tâche
// canonique du seed JSON.
export function projectTasksToEstimationTaches(
  rows: ProjectTaskRow[],
): EstimationTache[] {
  // Cache des trades chargés — évite de re-parser le même JSON pour chaque
  // tâche d'un même métier (cas le plus fréquent).
  const tradeCache = new Map<TradeKey, LoadedTrade>();

  return rows.map((row) => {
    let trade = tradeCache.get(row.trade_key);
    if (!trade) {
      trade = loadTrade(row.trade_key);
      tradeCache.set(row.trade_key, trade);
    }

    // Recherche linéaire dans les phases : OK pour quelques centaines de
    // tâches par métier (cf. brief §4, contrainte <1ms).
    let dureeReferenceMinutes: number | undefined;
    let materiauSechage: string | undefined;
    let proRecommended: boolean | undefined;
    if (row.template_task_id) {
      outer: for (const phase of trade.phases) {
        for (const task of phase.tasks) {
          if (task.id === row.template_task_id) {
            dureeReferenceMinutes = task.dureeReferenceMinutes;
            materiauSechage = task.materiauSechage;
            proRecommended = task.proRecommended;
            break outer;
          }
        }
      }
    }

    return {
      id: row.id,
      duree_reference_minutes: dureeReferenceMinutes,
      materiau_sechage: materiauSechage,
      pro_recommended: proRecommended,
    };
  });
}

// Récupère les tâches d'un projet et les transforme directement en
// EstimationTache. Server-only (utilise le client Supabase serveur).
export async function getEstimationTaches(projectId: string): Promise<EstimationTache[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });
  const rows = (data as ProjectTaskRow[] | null) ?? [];
  return projectTasksToEstimationTaches(rows);
}
