-- =============================================================
-- Klaro — Audit d'alignement schéma DB ↔ migrations
-- =============================================================
-- À exécuter en read-only dans Supabase Studio → SQL Editor pour
-- vérifier que toutes les colonnes attendues par les migrations
-- 0001-0004 existent en base.
--
-- Résultat attendu : aucune ligne retournée → DB alignée.
-- Si des lignes apparaissent : ce sont les colonnes manquantes.
-- =============================================================

with expected as (
  -- projects (0001 + 0003 rythme)
  select 'projects' as table_name, c as column_name from unnest(array[
    'id', 'user_id', 'name', 'type', 'surface', 'budget_range',
    'start_date', 'duration_range', 'rythme', 'created_at'
  ]) c
  union all
  -- project_trades (0001)
  select 'project_trades', c from unnest(array[
    'project_id', 'trade_key'
  ]) c
  union all
  -- project_tasks (0001)
  select 'project_tasks', c from unnest(array[
    'id', 'project_id', 'trade_key', 'phase_key', 'template_task_id',
    'label', 'status', 'is_blocking', 'is_custom', 'position',
    'created_at', 'done_at'
  ]) c
  union all
  -- user_profile (0002)
  select 'user_profile', c from unnest(array[
    'user_id', 'niveau', 'created_at', 'updated_at'
  ]) c
)
select
  e.table_name,
  e.column_name as colonne_manquante
from expected e
left join information_schema.columns c
  on c.table_schema = 'public'
  and c.table_name = e.table_name
  and c.column_name = e.column_name
where c.column_name is null
order by e.table_name, e.column_name;
