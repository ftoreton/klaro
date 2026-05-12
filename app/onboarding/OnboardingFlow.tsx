'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  TRADES_BY_PROJECT_TYPE,
  type ProjectType,
  type TradeKey,
} from '@/data/onboarding/trades';
import type { LoadedTrade } from '@/lib/onboarding/loader';
import type { NiveauUtilisateur } from '@/lib/niveau/types';
import Step1Project from './steps/Step1Project';
import Step2Specs from './steps/Step2Specs';
import Step3Niveau from './steps/Step3Niveau';
import Step4Trades from './steps/Step4Trades';
import Step5Tasks from './steps/Step5Tasks';
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
  trades: [],
  selectedTaskIds: {} as Record<TradeKey, string[]>,
};

const TOTAL_STEPS = 5;

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
  const [step, setStep] = useState(1);
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

  const canNext = (() => {
    if (step === 1) return state.name.trim().length > 0 && !!state.type;
    if (step === 2) return true;
    if (step === 3) return !!state.niveau;
    if (step === 4) return state.trades.length > 0;
    if (step === 5) return totalTasksSelected > 0;
    return false;
  })();

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
          trades: state.trades,
          selected_task_ids: state.selectedTaskIds,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Création échouée. Réessayez.');
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
        <div className="ob-step-info">Étape {step} / {TOTAL_STEPS}</div>
      </header>

      <div className="ob-progress" aria-hidden>
        <div className="ob-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>

      <main className="ob-main">
        {step === 1 && (
          <Step1Project
            firstName={firstName}
            name={state.name}
            type={state.type}
            onName={(name) => update({ name })}
            onType={onPickType}
          />
        )}
        {step === 2 && (
          <Step2Specs
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
        {step === 3 && (
          <Step3Niveau
            niveau={state.niveau}
            onPick={(niveau) => update({ niveau })}
          />
        )}
        {step === 4 && (
          <Step4Trades
            trades={trades}
            selected={state.trades}
            onToggle={onToggleTrade}
          />
        )}
        {step === 5 && (
          <Step5Tasks
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
        {step > 1 ? (
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={pending}
          >
            Retour
          </button>
        ) : <span />}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            disabled={!canNext}
            onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
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
