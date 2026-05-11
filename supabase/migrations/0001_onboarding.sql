-- =============================================================
-- Klaro — Onboarding schema (projects, trades, tasks) + RLS
-- À exécuter dans Supabase Studio → SQL Editor.
-- =============================================================

-- ── Tables ──────────────────────────────────────────────────

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in (
    'renovation_totale',
    'renovation_partielle',
    'extension',
    'construction_neuve'
  )),
  surface integer,
  budget_range text,
  start_date date,
  duration_range text,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);

create table if not exists public.project_trades (
  project_id uuid not null references public.projects(id) on delete cascade,
  trade_key text not null,
  primary key (project_id, trade_key)
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  trade_key text not null,
  phase_key text,
  template_task_id text,
  label text not null,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  is_blocking boolean not null default false,
  is_custom boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

create index if not exists project_tasks_project_id_idx on public.project_tasks(project_id);
create index if not exists project_tasks_project_status_idx on public.project_tasks(project_id, status);

-- ── Row Level Security ─────────────────────────────────────

alter table public.projects enable row level security;
alter table public.project_trades enable row level security;
alter table public.project_tasks enable row level security;

-- Projects : un user ne voit/modifie que les siens
drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- Project_trades : accès via le projet parent
drop policy if exists "trades_select_own" on public.project_trades;
drop policy if exists "trades_insert_own" on public.project_trades;
drop policy if exists "trades_delete_own" on public.project_trades;

create policy "trades_select_own" on public.project_trades for select
  using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "trades_insert_own" on public.project_trades for insert
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "trades_delete_own" on public.project_trades for delete
  using (project_id in (select id from public.projects where user_id = auth.uid()));

-- Project_tasks : accès via le projet parent
drop policy if exists "tasks_select_own" on public.project_tasks;
drop policy if exists "tasks_insert_own" on public.project_tasks;
drop policy if exists "tasks_update_own" on public.project_tasks;
drop policy if exists "tasks_delete_own" on public.project_tasks;

create policy "tasks_select_own" on public.project_tasks for select
  using (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "tasks_insert_own" on public.project_tasks for insert
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "tasks_update_own" on public.project_tasks for update
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
create policy "tasks_delete_own" on public.project_tasks for delete
  using (project_id in (select id from public.projects where user_id = auth.uid()));
