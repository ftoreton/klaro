'use client';

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Check, Info, Plus, TrendingDown, TrendingUp, X } from 'lucide-react';
import MetierCard from '@/components/chantier/MetierCard';
import TacheCard from '@/components/chantier/TacheCard';
import type { TacheCardState } from '@/components/chantier/TacheCard';
import '@/components/chantier/chantier.css';
import type { LoadedTrade } from '@/lib/onboarding/loader';
import type { TradeKey } from '@/data/onboarding/trades';
import type { ProjectTaskRow } from '@/lib/database.types';
import type { EstimationResult, EstimationTache, Rythme } from '@/lib/estimation/types';
import type { NiveauUtilisateur } from '@/lib/niveau/types';
import type { Palier } from '@/lib/pricing/types';
import { calculerEstimation } from '@/lib/estimation/calculate';
import {
  addTaskToProject,
  addTradeToProject,
  removeTaskFromProject,
  removeTradeFromProject,
} from '@/lib/chantier/actions';
import UpgradeModalPlaceholder from './UpgradeModalPlaceholder';

interface Props {
  project: { id: string; name: string; rythme: Rythme };
  niveau: NiveauUtilisateur;
  allTrades: Record<TradeKey, LoadedTrade>;
  initialTradeKeys: TradeKey[];
  initialTaskRows: ProjectTaskRow[];
  estimationInitiale: EstimationResult;
  currentPalier: Palier;
  nextPalier: Palier;
  upgradeDiffCents: number;
  tradesMeta: { key: TradeKey; label: string; icon: string }[];
  scrollToMetier: string | null;
}

function taskStateFromStatus(status: ProjectTaskRow['status']): TacheCardState {
  if (status === 'in_progress') return 'selectionnee_en_cours';
  if (status === 'done') return 'selectionnee_terminee';
  return 'selectionnee_non_commencee';
}

// ─── Optimistic state ─────────────────────────────────────
// Le state optimistic est la SOURCE DE VÉRITÉ UI. Il est appliqué
// immédiatement (sans attendre le serveur) ; les transitions React garantissent
// qu'il revient au state serveur si l'action échoue (revert auto).

interface ProjectState {
  tradeKeys: TradeKey[];
  taskRows: ProjectTaskRow[];
}

type OptimisticAction =
  | { kind: 'add-trade'; tradeKey: TradeKey }
  | { kind: 'remove-trade'; tradeKey: TradeKey }
  | {
      kind: 'add-task';
      projectId: string;
      tradeKey: TradeKey;
      templateTaskId: string;
      label: string;
      phaseKey: string;
      isBlocking: boolean;
    }
  | { kind: 'remove-task'; rowId: string };

function optimisticReducer(state: ProjectState, action: OptimisticAction): ProjectState {
  switch (action.kind) {
    case 'add-trade':
      if (state.tradeKeys.includes(action.tradeKey)) return state;
      return { ...state, tradeKeys: [...state.tradeKeys, action.tradeKey] };
    case 'remove-trade':
      return {
        ...state,
        tradeKeys: state.tradeKeys.filter((k) => k !== action.tradeKey),
      };
    case 'add-task': {
      const fakeRow: ProjectTaskRow = {
        id: `optimistic-${action.templateTaskId}`,
        project_id: action.projectId,
        trade_key: action.tradeKey,
        phase_key: action.phaseKey,
        template_task_id: action.templateTaskId,
        label: action.label,
        status: 'todo',
        is_blocking: action.isBlocking,
        is_custom: false,
        position: state.taskRows.length,
        created_at: new Date().toISOString(),
        done_at: null,
      };
      return { ...state, taskRows: [...state.taskRows, fakeRow] };
    }
    case 'remove-task':
      return { ...state, taskRows: state.taskRows.filter((r) => r.id !== action.rowId) };
  }
}

// ─── Toast queue (bottom-right) ──────────────────────────
type ToastVariant = 'success' | 'error';
interface ToastMessage {
  id: number;
  variant: ToastVariant;
  text: string;
}

export default function ChantierEditor({
  project,
  niveau,
  allTrades,
  initialTradeKeys,
  initialTaskRows,
  estimationInitiale,
  currentPalier,
  nextPalier,
  upgradeDiffCents,
  tradesMeta,
  scrollToMetier,
}: Props) {
  const [, startTransition] = useTransition();

  // ─── Optimistic state ──────────────────────────────────
  const [optimistic, applyOptimistic] = useOptimistic<ProjectState, OptimisticAction>(
    { tradeKeys: initialTradeKeys, taskRows: initialTaskRows },
    optimisticReducer,
  );

  // ─── Lookup table : templateTaskId → métadonnées estimation ──
  // Construit une seule fois à partir de allTrades (stable, passé en prop).
  // Permet de transformer une ProjectTaskRow en EstimationTache en O(1).
  const templateTaskMeta = useMemo(() => {
    const map = new Map<
      string,
      { duree?: number; sechage?: string; pro?: boolean }
    >();
    for (const trade of Object.values(allTrades)) {
      for (const phase of trade.phases) {
        for (const task of phase.tasks) {
          map.set(task.id, {
            duree: task.dureeReferenceMinutes,
            sechage: task.materiauSechage,
            pro: task.proRecommended,
          });
        }
      }
    }
    return map;
  }, [allTrades]);

  // ─── Estimation live (recalculée à chaque changement d'optimistic state) ──
  // `calculerEstimation` est pure, synchrone, < 1ms sur 50 tâches (cf. tests
  // du module Estimation). Le useMemo évite seulement le re-calcul si
  // l'état n'a pas changé.
  const liveEstimation = useMemo<EstimationResult>(() => {
    const taches: EstimationTache[] = optimistic.taskRows.map((row) => {
      const meta = row.template_task_id ? templateTaskMeta.get(row.template_task_id) : undefined;
      return {
        id: row.id,
        duree_reference_minutes: meta?.duree,
        materiau_sechage: meta?.sechage,
        pro_recommended: meta?.pro,
      };
    });
    return calculerEstimation({
      taches,
      niveau,
      rythme: project.rythme,
    });
  }, [optimistic.taskRows, templateTaskMeta, niveau, project.rythme]);

  // ─── Diff vs estimation initiale (jours → semaines arrondies) ──
  // Affichage indicatif déclenché seulement si > 1 semaine (~7j) de delta.
  const diffJours = liveEstimation.delai_central_jours - estimationInitiale.delai_central_jours;
  const diffSemaines = Math.round(diffJours / 7);
  const showDiff = Math.abs(diffSemaines) >= 1 && estimationInitiale.confiance !== 'indisponible';

  // ─── Browse mode (toggle "Ajouter une tâche" par métier) ──
  const [browseMode, setBrowseMode] = useState<Set<TradeKey>>(new Set());

  // ─── Modal upgrade (placeholder, remplacée par module Pricing) ─
  const [upgradeModal, setUpgradeModal] = useState<{
    tradeLabel: string;
    fromPalier: Palier;
    toPalier: Palier;
    diffCents: number;
  } | null>(null);

  // ─── Toast queue ───────────────────────────────────────
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (variant: ToastVariant, text: string) => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, variant, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((m) => m.id !== id));
    }, variant === 'error' ? 4000 : 2000);
  };

  // ─── Scroll auto sur ?metier= ──────────────────────────
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    if (!scrollToMetier) return;
    const target = sectionRefs.current[scrollToMetier];
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scrollToMetier]);

  // ─── Index dérivés (recalculés à chaque render à partir du state optimistic) ──
  const activeTradesSet = new Set(optimistic.tradeKeys);
  const taskRowsByTrade = new Map<TradeKey, ProjectTaskRow[]>();
  for (const row of optimistic.taskRows) {
    const key = row.trade_key as TradeKey;
    if (!taskRowsByTrade.has(key)) taskRowsByTrade.set(key, []);
    taskRowsByTrade.get(key)!.push(row);
  }
  const activeTaskTemplateIds = new Set(
    optimistic.taskRows.map((r) => r.template_task_id).filter((id): id is string => !!id),
  );

  const requiresUpgrade = nextPalier !== currentPalier;

  // ─── Handlers ──────────────────────────────────────────

  const onClickMetierCard = (tradeKey: TradeKey, isActive: boolean) => {
    if (isActive) {
      setBrowseMode((prev) => {
        const next = new Set(prev);
        if (next.has(tradeKey)) next.delete(tradeKey);
        else next.add(tradeKey);
        return next;
      });
      return;
    }

    const tradeLabel = tradesMeta.find((m) => m.key === tradeKey)?.label ?? tradeKey;
    startTransition(async () => {
      applyOptimistic({ kind: 'add-trade', tradeKey });
      try {
        const result = await addTradeToProject(project.id, tradeKey);
        if (result.kind === 'upgrade_required') {
          // L'optimistic add se revert automatiquement à la fin de la transition
          // (le server n'a pas inséré → re-render avec props inchangées).
          setUpgradeModal({
            tradeLabel,
            fromPalier: result.fromPalier,
            toPalier: result.toPalier,
            diffCents: result.diffCents,
          });
        } else {
          showToast('success', 'Métier ajouté');
        }
      } catch (e) {
        showToast('error', e instanceof Error ? e.message : 'Impossible d’ajouter le métier — réessaie');
      }
    });
  };

  const onRemoveMetier = (tradeKey: TradeKey) => {
    startTransition(async () => {
      applyOptimistic({ kind: 'remove-trade', tradeKey });
      try {
        const result = await removeTradeFromProject(project.id, tradeKey);
        if (result.kind === 'has_active_tasks') {
          showToast(
            'error',
            `Retire d'abord les ${result.taskLabels.length} tâche(s) actives de ce métier`,
          );
        } else {
          showToast('success', 'Métier retiré');
        }
      } catch (e) {
        showToast('error', e instanceof Error ? e.message : 'Impossible de retirer le métier');
      }
    });
  };

  const onAddTask = (
    tradeKey: TradeKey,
    templateTaskId: string,
    label: string,
    phaseKey: string,
    isBlocking: boolean,
  ) => {
    startTransition(async () => {
      applyOptimistic({
        kind: 'add-task',
        projectId: project.id,
        tradeKey,
        templateTaskId,
        label,
        phaseKey,
        isBlocking,
      });
      try {
        await addTaskToProject(project.id, templateTaskId, tradeKey);
        showToast('success', 'Tâche ajoutée');
      } catch (e) {
        showToast('error', e instanceof Error ? e.message : 'Tâche non ajoutée — réessaie');
      }
    });
  };

  const onRemoveTask = (rowId: string) => {
    startTransition(async () => {
      applyOptimistic({ kind: 'remove-task', rowId });
      try {
        await removeTaskFromProject(rowId);
        showToast('success', 'Tâche retirée');
      } catch (e) {
        showToast('error', e instanceof Error ? e.message : 'Tâche non retirée — réessaie');
      }
    });
  };

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="cm">
      {/* Header */}
      <header className="cm-head">
        <Link href="/dashboard" className="cm-back">
          <ArrowLeft size={14} />
          Retour au tableau de bord
        </Link>
        <h1 className="cm-h1">Modifier mon chantier</h1>
        <p className="cm-sub">
          Tes changements sont sauvegardés automatiquement. Ajout ou retrait d’un corps de métier
          qui change la tranche déclenche un paiement.
        </p>
      </header>

      {/* Sticky bar estimation — recalculée en temps réel via useMemo */}
      <div className="cm-sticky">
        <div className="cm-sticky-label">Estimation actuelle</div>
        {liveEstimation.confiance === 'indisponible' ? (
          <div className="cm-sticky-value">
            <Info size={14} />
            <span>Indisponible — calibration en cours</span>
          </div>
        ) : (
          <div className="cm-sticky-value">
            {/* La clé sur le mois déclenche la micro-animation à chaque changement */}
            <strong key={`m-${liveEstimation.delai_central_mois}`} className="cm-sticky-num">
              ~{liveEstimation.delai_central_mois} mois
            </strong>
            <span className="cm-sticky-detail">
              ({Math.round(liveEstimation.jours_travail_effectif)} jours de travail)
            </span>
            {showDiff && (
              <span
                className={`cm-sticky-diff ${diffSemaines > 0 ? 'is-up' : 'is-down'}`}
                aria-label={
                  diffSemaines > 0
                    ? `${diffSemaines} semaine(s) plus long que l'estimation initiale`
                    : `${Math.abs(diffSemaines)} semaine(s) plus court que l'estimation initiale`
                }
              >
                {diffSemaines > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {diffSemaines > 0 ? '+' : ''}
                {diffSemaines} semaine{Math.abs(diffSemaines) > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Section : corps de métier */}
      <section className="cm-section">
        <header className="cm-section-head">
          <h2 className="cm-h2">Corps de métier</h2>
          <span className="cm-section-count">
            {optimistic.tradeKeys.length} / {tradesMeta.length} actifs
          </span>
        </header>

        <div className="cm-metiers-grid">
          {tradesMeta.map((meta) => {
            const isActive = activeTradesSet.has(meta.key);
            const tradeRows = taskRowsByTrade.get(meta.key) ?? [];
            const activeTaskCount = tradeRows.length;
            const totalTaskCount = allTrades[meta.key]?.totalTasks ?? 0;

            let state:
              | 'actif_paye_avec_taches'
              | 'actif_paye_sans_taches'
              | 'disponible_sans_upgrade'
              | 'disponible_avec_upgrade';
            if (isActive) {
              state = activeTaskCount > 0 ? 'actif_paye_avec_taches' : 'actif_paye_sans_taches';
            } else {
              state = requiresUpgrade ? 'disponible_avec_upgrade' : 'disponible_sans_upgrade';
            }

            return (
              <MetierCard
                key={meta.key}
                meta={meta}
                state={state}
                activeTaskCount={isActive ? activeTaskCount : undefined}
                totalTaskCount={totalTaskCount}
                upgradePriceCents={state === 'disponible_avec_upgrade' ? upgradeDiffCents : undefined}
                removeDisabledReason={
                  state === 'actif_paye_avec_taches'
                    ? "Retire d'abord toutes les tâches de ce métier"
                    : undefined
                }
                onClick={() => onClickMetierCard(meta.key, isActive)}
                onRemove={
                  state === 'actif_paye_sans_taches'
                    ? () => onRemoveMetier(meta.key)
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>

      {/* Section : tâches par métier actif */}
      <section className="cm-section">
        <header className="cm-section-head">
          <h2 className="cm-h2">Tâches par métier</h2>
        </header>

        {optimistic.tradeKeys.length === 0 ? (
          <div className="cm-empty">
            Aucun métier actif. Ajoute-en un dans la section ci-dessus pour commencer.
          </div>
        ) : (
          <div className="cm-tasks-groups">
            {optimistic.tradeKeys.map((tradeKey) => {
              const trade = allTrades[tradeKey];
              if (!trade) return null;
              const tradeRows = taskRowsByTrade.get(tradeKey) ?? [];
              const meta = tradesMeta.find((m) => m.key === tradeKey);
              const isBrowsing = browseMode.has(tradeKey);

              const rowByTemplateId = new Map<string, ProjectTaskRow>();
              for (const r of tradeRows) {
                if (r.template_task_id) rowByTemplateId.set(r.template_task_id, r);
              }

              return (
                <article
                  key={tradeKey}
                  className="cm-trade-block"
                  ref={(el) => {
                    sectionRefs.current[tradeKey] = el;
                  }}
                >
                  <header className="cm-trade-head">
                    <span className="cm-trade-icon" aria-hidden>{meta?.icon ?? '🛠️'}</span>
                    <span className="cm-trade-label">{meta?.label ?? tradeKey}</span>
                    <span className="cm-trade-count">
                      {tradeRows.length} / {trade.totalTasks} tâches
                    </span>
                  </header>

                  {trade.phases.map((phase) => {
                    const visibleTasks = isBrowsing
                      ? phase.tasks
                      : phase.tasks.filter((t) => activeTaskTemplateIds.has(t.id));

                    if (visibleTasks.length === 0) return null;

                    return (
                      <div key={phase.id} className="cm-phase">
                        <h4 className="cm-phase-label">{phase.label}</h4>
                        <ul className="cm-task-list">
                          {visibleTasks.map((task) => {
                            const row = rowByTemplateId.get(task.id);
                            const isSelected = !!row;
                            const state: TacheCardState = isSelected
                              ? taskStateFromStatus(row!.status)
                              : 'disponible';
                            const isLocked = state === 'selectionnee_en_cours' || state === 'selectionnee_terminee';

                            return (
                              <li key={task.id}>
                                <TacheCard
                                  state={state}
                                  label={task.title}
                                  isBlocking={task.isBlocking}
                                  onToggle={
                                    isLocked
                                      ? undefined
                                      : () => {
                                          if (row) {
                                            onRemoveTask(row.id);
                                          } else {
                                            onAddTask(
                                              tradeKey,
                                              task.id,
                                              task.title,
                                              phase.id,
                                              task.isBlocking,
                                            );
                                          }
                                        }
                                  }
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}

                  <div className="cm-trade-add">
                    <button
                      type="button"
                      className="cm-add-task"
                      onClick={() => {
                        setBrowseMode((prev) => {
                          const next = new Set(prev);
                          if (next.has(tradeKey)) next.delete(tradeKey);
                          else next.add(tradeKey);
                          return next;
                        });
                      }}
                    >
                      <Plus size={14} strokeWidth={2.4} />
                      {isBrowsing ? 'Masquer les tâches disponibles' : 'Ajouter une tâche'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal upgrade (placeholder — vraie logique Stripe dans module Pricing) */}
      <UpgradeModalPlaceholder
        open={upgradeModal !== null}
        tradeLabel={upgradeModal?.tradeLabel ?? ''}
        currentPalier={upgradeModal?.fromPalier ?? currentPalier}
        nextPalier={upgradeModal?.toPalier ?? nextPalier}
        diffCents={upgradeModal?.diffCents ?? 0}
        onClose={() => setUpgradeModal(null)}
      />

      {/* Toast queue (bottom-right) */}
      {toasts.length > 0 && (
        <div className="cm-toast-queue" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`cm-toast cm-toast-${t.variant}`} role="status">
              <span className="cm-toast-icon" aria-hidden>
                {t.variant === 'success' ? <Check size={14} strokeWidth={3} /> : <AlertTriangle size={14} />}
              </span>
              <span className="cm-toast-text">{t.text}</span>
              <button
                type="button"
                className="cm-toast-close"
                onClick={() => setToasts((q) => q.filter((m) => m.id !== t.id))}
                aria-label="Fermer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
