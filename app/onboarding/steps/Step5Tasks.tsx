'use client';

import { useState } from 'react';
import type { TradeKey } from '@/data/onboarding/trades';
import type { LoadedTrade } from '@/lib/onboarding/loader';

type Props = {
  trades: Record<TradeKey, LoadedTrade>;
  tradeKeys: TradeKey[];
  selectedTaskIds: Record<TradeKey, string[]>;
  onToggleTask: (trade: TradeKey, taskId: string, on: boolean) => void;
  onTogglePhase: (trade: TradeKey, phaseId: string, on: boolean) => void;
  totalSelected: number;
};

export default function Step5Tasks({
  trades,
  tradeKeys,
  selectedTaskIds,
  onToggleTask,
  onTogglePhase,
  totalSelected,
}: Props) {
  const [openTrade, setOpenTrade] = useState<TradeKey | null>(tradeKeys[0] ?? null);

  return (
    <section className="ob-step">
      <h1 className="ob-h1">Tes tâches</h1>
      <p className="ob-sub">
        Klaro a généré ta checklist depuis son référentiel métier (basé DTU). Décoche ce qui ne te concerne pas — tu pourras tout ajuster depuis le tableau de bord.
      </p>

      <div className="ob-tasks-badge" role="status" aria-live="polite">
        <strong>{totalSelected}</strong>&nbsp;tâche{totalSelected > 1 ? 's' : ''} sélectionnée{totalSelected > 1 ? 's' : ''}
      </div>

      <div className="ob-tasks-groups">
        {tradeKeys.map((key) => {
          const trade = trades[key];
          if (!trade) return null;
          const open = openTrade === key;
          const selected = new Set(selectedTaskIds[key] ?? []);

          return (
            <div key={key} className={`ob-tg ${open ? 'is-open' : ''}`}>
              <button
                type="button"
                className="ob-tg-head"
                onClick={() => setOpenTrade(open ? null : key)}
                aria-expanded={open}
              >
                <span className="ob-tg-icon">{trade.icon}</span>
                <span className="ob-tg-label">{trade.label}</span>
                <span className="ob-tg-count">{selected.size}/{trade.totalTasks}</span>
                <svg className="ob-tg-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {open && (
                <div className="ob-tg-body">
                  {trade.phases.map((phase) => {
                    const phaseSelected = phase.tasks.filter((t) => selected.has(t.id)).length;
                    const allOn = phaseSelected === phase.tasks.length;
                    const someOn = phaseSelected > 0 && !allOn;
                    return (
                      <div key={phase.id} className="ob-phase">
                        <div className="ob-phase-head">
                          <label className={`ob-phase-toggle ${allOn ? 'is-on' : someOn ? 'is-partial' : ''}`}>
                            <input
                              type="checkbox"
                              checked={allOn}
                              ref={(el) => {
                                if (el) el.indeterminate = someOn;
                              }}
                              onChange={(e) => onTogglePhase(key, phase.id, e.target.checked)}
                            />
                            <span className="ob-task-box" aria-hidden>
                              {(allOn || someOn) && (
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  {someOn ? <line x1="5" y1="12" x2="19" y2="12" /> : <path d="M20 6L9 17l-5-5" />}
                                </svg>
                              )}
                            </span>
                            <span className="ob-phase-label">{phase.label}</span>
                            <span className="ob-phase-count">{phaseSelected}/{phase.tasks.length}</span>
                          </label>
                        </div>

                        <ul className="ob-tg-tasks">
                          {phase.tasks.map((task) => {
                            const on = selected.has(task.id);
                            return (
                              <li key={task.id}>
                                <label className={`ob-task ${on ? 'is-on' : ''}`}>
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={(e) => onToggleTask(key, task.id, e.target.checked)}
                                  />
                                  <span className="ob-task-box" aria-hidden>
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </span>
                                  <span className="ob-task-label">{task.title}</span>
                                  {task.isBlocking && (
                                    <span className="ob-task-tag" title="Critique — débloquage justifié requis">critique</span>
                                  )}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
