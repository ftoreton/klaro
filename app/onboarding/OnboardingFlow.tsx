'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  TRADES_BY_PROJECT_TYPE,
  type ProjectType,
  type TradeKey,
} from '@/data/onboarding/trades';
import type { LoadedTrade } from '@/lib/onboarding/loader';
import type { NiveauUtilisateur } from '@/lib/niveau/types';
import type { Rythme } from '@/lib/estimation/types';
import StepProjet from './steps/StepProjet';
import StepSpecs from './steps/StepSpecs';
import StepNiveau from './steps/StepNiveau';
import StepRythme from './steps/StepRythme';
import StepTrades from './steps/StepTrades';
import StepTasks from './steps/StepTasks';
import { createProjectFromOnboarding } from './actions';
import './onboarding.css';

export type OnboardingState = {
  name: string;
  type: ProjectType | null;
  surface: number | null;
  budget_range: string | null;
  start_date: string | null;
  duration_range: string | null;
  niveau: NiveauUtilisateur | null;
  rythme: Rythme | null;
  trades: TradeKey[];
  // Sélection par ID de tâche source (stable). `tradeKey: [taskId, ...]`.
  selectedTaskIds: Record<TradeKey, string[]>;
};

const EMPTY_STATE: OnboardingState = {
  name: '',
  type: null,
  surface: null,
  budget_range: null,
  start_date: null,
  duration_range: null,
  niveau: null,
  rythme: null,
  trades: [],
  selectedTaskIds: {} as Record<TradeKey, string[]>,
};

// ─────────────────────────────────────────────────────
// Ordre canonique des étapes.
// Pour réordonner ou insérer une étape : modifier ce tableau, rien d'autre.
// ─────────────────────────────────────────────────────
type StepKey = 'projet' | 'specs' | 'niveau' | 'rythme' | 'trades' | 'tasks';

type StepDef = {
  key: StepKey;
  canNext: (state: OnboardingState, helpers: { totalTasks: number }) => boolean;
};

const STEPS: readonly StepDef[] = [
  { key: 'projet', canNext: (s) => s.name.trim().length > 0 && !!s.type },
  { key: 'specs', canNext: () => true },
  { key: 'niveau', canNext: (s) => !!s.niveau },
  { key: 'rythme', canNext: (s) => !!s.rythme },
  { key: 'trades', canNext: (s) => s.trades.length > 0 },
  { key: 'tasks', canNext: (_, h) => h.totalTasks > 0 },
];

const TOTAL_STEPS = STEPS.length;

function allTaskIdsOfTrade(loaded: LoadedTrade): string[] {
  const out: string[] = [];
  for (const p of loaded.phases) {
    for (const t of p.tasks) out.push(t.id);
  }
  return out;
}

export default function OnboardingFlow({
  firstName,
  trades,
}: {
  firstName: string | null;
  trades: Record<TradeKey, LoadedTrade>;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<OnboardingState>(EMPTY_STATE);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<OnboardingState>) => setState((s) => ({ ...s, ...patch }));

  // Choix d'un type → présélectionne métiers + toutes leurs tâches.
  const onPickType = (type: ProjectType) => {
    const tradeKeys = TRADES_BY_PROJECT_TYPE[type];
    const selectedTaskIds = {} as Record<TradeKey, string[]>;
    for (const key of tradeKeys) {
      const loaded = trades[key];
      if (loaded) selectedTaskIds[key] = allTaskIdsOfTrade(loaded);
    }
    update({ type, trades: [...tradeKeys], selectedTaskIds });
  };

  const onToggleTrade = (key: TradeKey, on: boolean) => {
    const nextTrades = on
      ? Array.from(new Set([...state.trades, key]))
      : state.trades.filter((k) => k !== key);
    const nextSelected = { ...state.selectedTaskIds };
    if (on && !nextSelected[key]) {
      const loaded = trades[key];
      if (loaded) nextSelected[key] = allTaskIdsOfTrade(loaded);
    } else if (!on) {
      delete nextSelected[key];
    }
    update({ trades: nextTrades, selectedTaskIds: nextSelected });
  };

  const onToggleTask = (trade: TradeKey, taskId: string, on: boolean) => {
    const current = new Set(state.selectedTaskIds[trade] ?? []);
    if (on) current.add(taskId);
    else current.delete(taskId);
    update({ selectedTaskIds: { ...state.selectedTaskIds, [trade]: Array.from(current) } });
  };

  const onTogglePhase = (trade: TradeKey, phaseId: string, on: boolean) => {
    const loaded = trades[trade];
    if (!loaded) return;
    const phase = loaded.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    const ids = phase.tasks.map((t) => t.id);
    const current = new Set(state.selectedTaskIds[trade] ?? []);
    if (on) ids.forEach((id) => current.add(id));
    else ids.forEach((id) => current.delete(id));
    update({ selectedTaskIds: { ...state.selectedTaskIds, [trade]: Array.from(current) } });
  };

  const totalTasksSelected = useMemo(
    () => Object.values(state.selectedTaskIds).reduce((acc, arr) => acc + arr.length, 0),
    [state.selectedTaskIds],
  );

  const currentStep = STEPS[stepIndex];
  const canNext = currentStep.canNext(state, { totalTasks: totalTasksSelected });
  const isLastStep = stepIndex === TOTAL_STEPS - 1;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createProjectFromOnboarding({
          name: state.name,
          type: state.type!,
          surface: state.surface,
          budget_range: state.budget_range,
          start_date: state.start_date,
          duration_range: state.duration_range,
          niveau: state.niveau!,
          rythme: state.rythme!,
          trades: state.trades,
          selected_task_ids: state.selectedTaskIds,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Création échouée. Réessaye.');
      }
    });
  };

  return (
    <div className="ob-root">
      <header className="ob-head">
        <div className="ob-logo" aria-label="Klaro">
          <span className="ob-logo-mark">K</span>
          <span className="ob-logo-name">Klaro</span>
        </div>
        <div className="ob-step-info">Étape {stepIndex + 1} / {TOTAL_STEPS}</div>
      </header>

      <div className="ob-progress" aria-hidden>
        <div
          className="ob-progress-fill"
          style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <main className="ob-main">
        {currentStep.key === 'projet' && (
          <StepProjet
            firstName={firstName}
            name={state.name}
            type={state.type}
            onName={(name) => update({ name })}
            onType={onPickType}
          />
        )}
        {currentStep.key === 'specs' && (
          <StepSpecs
            surface={state.surface}
            budgetRange={state.budget_range}
            startDate={state.start_date}
            durationRange={state.duration_range}
            onSurface={(surface) => update({ surface })}
            onBudget={(budget_range) => update({ budget_range })}
            onStartDate={(start_date) => update({ start_date })}
            onDuration={(duration_range) => update({ duration_range })}
          />
        )}
        {currentStep.key === 'niveau' && (
          <StepNiveau
            niveau={state.niveau}
            onPick={(niveau) => update({ niveau })}
          />
        )}
        {currentStep.key === 'rythme' && (
          <StepRythme
            rythme={state.rythme}
            onPick={(rythme) => update({ rythme })}
          />
        )}
        {currentStep.key === 'trades' && (
          <StepTrades
            trades={trades}
            selected={state.trades}
            onToggle={onToggleTrade}
          />
        )}
        {currentStep.key === 'tasks' && (
          <StepTasks
            trades={trades}
            tradeKeys={state.trades}
            selectedTaskIds={state.selectedTaskIds}
            onToggleTask={onToggleTask}
            onTogglePhase={onTogglePhase}
            totalSelected={totalTasksSelected}
          />
        )}

        {error && <div className="ob-error">{error}</div>}
      </main>

      <footer className="ob-footer">
        {stepIndex > 0 ? (
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={pending}
          >
            Retour
          </button>
        ) : <span />}

        {!isLastStep ? (
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            disabled={!canNext}
            onClick={() => setStepIndex((i) => Math.min(TOTAL_STEPS - 1, i + 1))}
          >
            Continuer
          </button>
        ) : (
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            disabled={!canNext || pending}
            onClick={submit}
          >
            {pending ? 'Création de ton chantier…' : 'Créer mon chantier'}
          </button>
        )}
      </footer>
    </div>
  );
}
