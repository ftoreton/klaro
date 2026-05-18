'use client';

import { useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import type { ProjectTaskRow } from '@/lib/database.types';
import type { EstimationResult } from '@/lib/estimation/types';
import { toggleTaskStatus } from '@/app/onboarding/actions';
import EstimationCard from '@/components/dashboard/EstimationCard';

type TradeMeta = {
  key: string;
  label: string;
  icon: string;
  phaseLabels: Record<string, string>;
};

type Props = {
  project: { id: string; name: string; type: string };
  tasks: ProjectTaskRow[];
  tradeMeta: TradeMeta[];
  score: number;
  tone: 'success' | 'warn' | 'danger';
  stats: { done: number; total: number; blocking: number };
  estimation: EstimationResult;
};

const TONE_LABEL: Record<Props['tone'], string> = {
  success: 'Bon avancement',
  warn: 'À surveiller',
  danger: 'En tension',
};

export default function DashboardClient({ project, tasks, tradeMeta, estimation }: Props) {
  const [optimisticTasks, applyOptimistic] = useOptimistic(
    tasks,
    (state: ProjectTaskRow[], action: { id: string; status: ProjectTaskRow['status'] }) =>
      state.map((t) =>
        t.id === action.id
          ? { ...t, status: action.status, done_at: action.status === 'done' ? new Date().toISOString() : null }
          : t,
      ),
  );
  const [, startTransition] = useTransition();

  const onToggle = (task: ProjectTaskRow) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    startTransition(async () => {
      applyOptimistic({ id: task.id, status: nextStatus });
      try {
        await toggleTaskStatus(task.id, nextStatus);
      } catch {
        // RSC re-fetch handles error recovery.
      }
    });
  };

  const liveTotal = optimisticTasks.length;
  const liveDone = optimisticTasks.filter((t) => t.status === 'done').length;
  const liveBlocking = optimisticTasks.filter((t) => t.is_blocking && t.status !== 'done').length;
  const liveCompletion = liveTotal > 0 ? Math.round((liveDone / liveTotal) * 100) : 0;
  const liveScore = liveTotal === 0 ? 100 : Math.max(20, Math.min(100, liveCompletion - liveBlocking * 8));
  const liveTone: Props['tone'] = liveScore >= 75 ? 'success' : liveScore >= 50 ? 'warn' : 'danger';

  const recommended = optimisticTasks.filter((t) => t.status !== 'done').slice(0, 5);
  const blockingTask = optimisticTasks.find((t) => t.is_blocking && t.status !== 'done');

  // Group tasks by trade, then by phase (preserving the original position order).
  type Group = { phaseKey: string; phaseLabel: string; tasks: ProjectTaskRow[] };
  const groupedByTrade = tradeMeta.map((trade) => {
    const tradeTasks = optimisticTasks.filter((t) => t.trade_key === trade.key);
    const byPhase = new Map<string, ProjectTaskRow[]>();
    const phaseOrder: string[] = [];
    for (const t of tradeTasks) {
      const key = t.phase_key ?? 'autres';
      if (!byPhase.has(key)) {
        byPhase.set(key, []);
        phaseOrder.push(key);
      }
      byPhase.get(key)!.push(t);
    }
    const groups: Group[] = phaseOrder.map((p) => ({
      phaseKey: p,
      phaseLabel: trade.phaseLabels[p] ?? 'Autres',
      tasks: byPhase.get(p)!,
    }));
    const tradeDone = tradeTasks.filter((t) => t.status === 'done').length;
    return { trade, groups, total: tradeTasks.length, done: tradeDone };
  }).filter((g) => g.total > 0);

  return (
    <div className="db">
      {/* Score */}
      <div className={`db-score db-tone-${liveTone}`}>
        <div className="db-score-num">
          <span className="db-score-v">{liveScore}</span>
          <span className="db-score-l">/ 100</span>
        </div>
        <div className="db-score-info">
          <div className="db-eyebrow">Score chantier · {project.name}</div>
          <h2>{TONE_LABEL[liveTone]}</h2>
          <p>
            {liveDone}/{liveTotal} tâches finies
            {liveBlocking > 0 && (
              <>
                {' · '}
                <span className="db-alert-mark">{liveBlocking} blocage{liveBlocking > 1 ? 's' : ''}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Estimation chantier */}
      <EstimationCard estimation={estimation} />

      {/* Action : modifier le chantier */}
      <div className="db-actions">
        <Link href="/chantier/modifier" className="db-action-btn">
          <Settings2 size={14} />
          Modifier mon chantier
        </Link>
      </div>

      {/* Blocking banner */}
      {blockingTask && (
        <div className="db-banner">
          <div className="db-banner-ic" aria-hidden>!</div>
          <div className="db-banner-txt">
            <div className="db-banner-t">Klaro a détecté un blocage</div>
            <div className="db-banner-s">{blockingTask.label}</div>
          </div>
        </div>
      )}

      {/* Recommended */}
      <section className="db-section">
        <header className="db-section-head">
          <h3>Klaro te recommande</h3>
          <span className="db-count">{recommended.length} à faire</span>
        </header>

        {recommended.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-ic" aria-hidden>✓</div>
            <h4>Klaro voit clair</h4>
            <p>Toutes les tâches prioritaires sont traitées.</p>
          </div>
        ) : (
          <ul className="db-tasks">
            {recommended.map((t) => {
              const trade = tradeMeta.find((tm) => tm.key === t.trade_key);
              return (
                <li key={t.id} className={`db-task ${t.is_blocking ? 'is-blocking' : ''}`}>
                  <button
                    type="button"
                    className="db-task-check"
                    onClick={() => onToggle(t)}
                    aria-label="Marquer comme finie"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                  <div className="db-task-info">
                    <div className="db-task-label">{t.label}</div>
                    <div className="db-task-meta">
                      {trade && <span className="db-task-trade">{trade.icon} {trade.label}</span>}
                      {t.is_blocking && <span className="db-task-tag">Critique</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* All tasks, grouped by trade then phase */}
      <section className="db-section">
        <header className="db-section-head">
          <h3>Toutes les tâches</h3>
          <span className="db-count">{liveTotal} au total</span>
        </header>

        {groupedByTrade.map(({ trade, groups, total, done }) => (
          <div key={trade.key} className="db-trade-block">
            <div className="db-trade-head">
              <span className="db-trade-icon">{trade.icon}</span>
              <span className="db-trade-label">{trade.label}</span>
              <span className="db-trade-count">{done}/{total}</span>
            </div>

            {groups.map((group) => (
              <div key={group.phaseKey} className="db-phase-block">
                <div className="db-phase-head">{group.phaseLabel}</div>
                <ul className="db-tasks">
                  {group.tasks.map((t) => (
                    <li
                      key={t.id}
                      className={`db-task ${t.status === 'done' ? 'is-done' : ''} ${t.is_blocking ? 'is-blocking' : ''}`}
                    >
                      <button
                        type="button"
                        className="db-task-check"
                        onClick={() => onToggle(t)}
                        aria-label={t.status === 'done' ? 'Marquer comme à faire' : 'Marquer comme finie'}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </button>
                      <div className="db-task-info">
                        <div className="db-task-label">{t.label}</div>
                        {t.is_blocking && t.status !== 'done' && (
                          <div className="db-task-meta">
                            <span className="db-task-tag">Critique</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
