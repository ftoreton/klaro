// Types des tables Supabase utilisées par l'onboarding et le dashboard.
// Type minimal écrit à la main — peut être remplacé par `supabase gen types`
// si on installe la CLI plus tard.

import type { ProjectType, TradeKey } from '@/data/onboarding/trades';

export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  type: ProjectType;
  surface: number | null;
  budget_range: string | null;
  start_date: string | null;
  duration_range: string | null;
  created_at: string;
};

export type ProjectTradeRow = {
  project_id: string;
  trade_key: TradeKey;
};

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type ProjectTaskRow = {
  id: string;
  project_id: string;
  trade_key: TradeKey;
  phase_key: string | null;
  template_task_id: string | null;
  label: string;
  status: TaskStatus;
  is_blocking: boolean;
  is_custom: boolean;
  position: number;
  created_at: string;
  done_at: string | null;
};
