-- =============================================================
-- Klaro — Rythme de chantier (lié au projet, pas à l'utilisateur)
-- À exécuter dans Supabase Studio → SQL Editor, après 0002.
-- =============================================================

-- Le rythme représente la cadence de travail du particulier sur son chantier
-- (temps plein / soirs et we / we seul / quelques we par mois).
-- Il pondère le délai calendaire calculé par le module Estimation.

alter table public.projects
  add column if not exists rythme text not null default 'soirs_et_we'
    check (rythme in ('temps_plein', 'soirs_et_we', 'we_seul', 'quelques_we_mois'));

-- Pas de RLS supplémentaire : la colonne hérite des policies existantes
-- de la table projects (un user ne voit/modifie que ses propres projets).
