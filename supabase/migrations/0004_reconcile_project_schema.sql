-- =============================================================
-- Klaro — Réconciliation du schéma project_tasks / projects
-- =============================================================
-- Pourquoi cette migration :
-- En cours de dev sur le module Modification du chantier, on a constaté
-- qu'au moins un environnement (DB Florent) avait exécuté une version
-- antérieure ou partielle de `0001_onboarding.sql` — résultat : certaines
-- colonnes prévues par 0001 manquaient en base (`is_blocking`, `phase_key`,
-- `status`, `position`, etc.) et l'app cassait au moment d'insérer un
-- `project_tasks`.
--
-- Cette migration aligne défensivement le schéma sur la définition cible
-- du 0001. Idempotente : `IF NOT EXISTS` partout, safe à relancer même si
-- toutes les colonnes existent déjà.
--
-- Pas d'impact pour les nouvelles DB qui ont exécuté la dernière version
-- de 0001 : tout sera déjà en place et la migration est un no-op.
-- =============================================================

-- ── project_tasks : colonnes manquantes ─────────────────────
alter table public.project_tasks
  add column if not exists phase_key text,
  add column if not exists template_task_id text,
  add column if not exists status text not null default 'todo',
  add column if not exists is_blocking boolean not null default false,
  add column if not exists is_custom boolean not null default false,
  add column if not exists position integer not null default 0,
  add column if not exists done_at timestamptz;

-- ── project_tasks : contrainte CHECK sur status ────────────
-- Drop + recreate plutôt qu'un `if not exists` (Postgres ne supporte pas
-- cette forme pour les contraintes). Idempotent quand même : drop ne fait
-- rien si la contrainte n'existe pas.
alter table public.project_tasks
  drop constraint if exists project_tasks_status_check;
alter table public.project_tasks
  add constraint project_tasks_status_check
    check (status in ('todo', 'in_progress', 'done'));

-- ── project_tasks : indexes du dashboard ───────────────────
create index if not exists project_tasks_project_id_idx
  on public.project_tasks(project_id);
create index if not exists project_tasks_project_status_idx
  on public.project_tasks(project_id, status);

-- ── projects : colonnes optionnelles renseignées à l'onboarding ──
alter table public.projects
  add column if not exists surface integer,
  add column if not exists budget_range text,
  add column if not exists start_date date,
  add column if not exists duration_range text;
