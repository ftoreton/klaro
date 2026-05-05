export type TaskStatut = 'terminé' | 'en cours' | 'à faire';
export type TaskPriorite = 'critique' | 'important' | 'secondaire';
export type AlertType = 'devis' | 'blocage' | 'retard' | 'critique';
export type ScoreTone = 'success' | 'warn' | 'danger';
export type ScenarioKey = 'enCours' | 'demarrage' | 'crise';

export interface Task {
  id: string;
  nom: string;
  metier: string;
  statut: TaskStatut;
  priorite: TaskPriorite;
  depends: string[];
  dueIn: number;
  artisan: string | null;
}

export interface Devis {
  id: string;
  metier: string;
  fichier: string;
  montant: string;
  artisan: string;
  signe: boolean;
  recuDepuis: number;
  bloqueLe?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  score: number;
  titre: string;
  explication: string;
  meta: Record<string, string | number | boolean | undefined>;
  actions: string[];
}

export interface ProjectScore {
  value: number;
  message: string;
  tone: ScoreTone;
  breakdown: {
    overdue: number;
    blocked: number;
    unassigned: number;
    done: number;
    unsignedDevis: number;
  };
}

export interface ScoredTask extends Task {
  _score: number;
  _blocker: boolean;
  _overdue: boolean;
}

export interface Blockage {
  task: Task;
  blockedBy: string | null;
  message: string;
}

export interface ComputeResult {
  score: ProjectScore;
  todays: ScoredTask[];
  alerts: Alert[];
  blockages: Blockage[];
  stats: {
    done: number;
    total: number;
    overdue: number;
    blocked: number;
  };
}

export interface ProjectInfo {
  nom: string;
  lieu: string;
  jour: string;
}

export interface Scenario {
  label: string;
  sub: string;
  project: ProjectInfo;
  tasks: Task[];
  devis: Devis[];
}

export interface AppState {
  scenario: ScenarioKey;
  project: ProjectInfo;
  tasks: Task[];
  devis: Devis[];
  dismissedAlerts: string[];
}
