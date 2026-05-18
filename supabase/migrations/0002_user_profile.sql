-- =============================================================
-- Klaro — Profil utilisateur (niveau bricoleur) + RLS
-- À exécuter dans Supabase Studio → SQL Editor, après 0001.
-- =============================================================

-- ── Table ────────────────────────────────────────────────────

create table if not exists public.user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  niveau text not null check (niveau in (
    'bricoleur_du_dimanche',
    'bricoleur_moyen',
    'bricoleur_aguerri',
    'artisan'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Maintien automatique de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profile_set_updated_at on public.user_profile;
create trigger user_profile_set_updated_at
  before update on public.user_profile
  for each row execute function public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────

alter table public.user_profile enable row level security;

drop policy if exists "user_profile_select_own" on public.user_profile;
drop policy if exists "user_profile_insert_own" on public.user_profile;
drop policy if exists "user_profile_update_own" on public.user_profile;

create policy "user_profile_select_own" on public.user_profile
  for select using (auth.uid() = user_id);
create policy "user_profile_insert_own" on public.user_profile
  for insert with check (auth.uid() = user_id);
create policy "user_profile_update_own" on public.user_profile
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Note : pas de policy DELETE. Un user qui supprime son compte
-- déclenche le cascade depuis auth.users.
