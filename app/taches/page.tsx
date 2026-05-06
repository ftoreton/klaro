'use client';

import { useState, useMemo } from 'react';
import { useKlaro } from '@/app/providers';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import ScenarioPanel from '@/components/ScenarioPanel';
import Toast from '@/components/ui/Toast';
import Icon from '@/components/ui/Icon';
import type { Task } from '@/lib/types';

type FilterKey = 'all' | 'todo' | 'doing' | 'done';
type GroupKey = 'metier' | 'status';

interface AnalyzedTask extends Task {
  isOverdue: boolean;
  isToday: boolean;
  isBlocked: boolean;
  blockerName: string | null;
}

function analyze(tasks: Task[]): AnalyzedTask[] {
  return tasks.map((t) => {
    const blocker = (t.depends || [])
      .map((id) => tasks.find((x) => x.id === id))
      .find((d) => d && d.statut !== 'terminé');
    return {
      ...t,
      isOverdue: t.statut !== 'terminé' && t.dueIn < 0,
      isToday: t.statut !== 'terminé' && t.dueIn === 0,
      isBlocked: !!blocker && t.statut !== 'terminé',
      blockerName: blocker ? blocker.nom : null,
    };
  });
}

function dueLabel(dueIn: number, statut: string): string {
  if (statut === 'terminé') return 'finie';
  if (dueIn < 0) return `${Math.abs(dueIn)}j de retard`;
  if (dueIn === 0) return "aujourd'hui";
  if (dueIn === 1) return 'demain';
  return `dans ${dueIn}j`;
}

function priorityClass(p: string): string {
  if (p === 'critique') return 'danger';
  if (p === 'important') return 'warn';
  return '';
}

function TaskRow({
  task,
  onValidate,
  onLater,
}: {
  task: AnalyzedTask;
  onValidate: (id: string) => void;
  onLater: (id: string) => void;
}) {
  const isDone = task.statut === 'terminé';
  const rowClasses = [
    'taches-row',
    isDone ? 'done' : '',
    task.isOverdue ? 'overdue' : '',
    task.isBlocked ? 'blocked' : '',
    task.isToday ? 'today' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClasses}>
      <button
        className="taches-check"
        onClick={() => !isDone && !task.isBlocked && onValidate(task.id)}
        aria-label={isDone ? 'Tâche terminée' : 'Marquer comme terminée'}
        disabled={isDone || task.isBlocked}
      >
        {isDone && <Icon name="check" size={12} strokeWidth={3} />}
      </button>

      <div className="taches-info">
        <div className="taches-name">{task.nom}</div>
        <div className="taches-meta">
          <span className="taches-metier">{task.metier}</span>
          {task.artisan && (
            <>
              <span className="sep" />
              <span><Icon name="user" size={11} /> {task.artisan}</span>
            </>
          )}
          {!isDone && (
            <>
              <span className="sep" />
              <span className={task.isOverdue ? 'taches-due-overdue' : task.isToday ? 'taches-due-today' : ''}>
                <Icon name="clock" size={11} /> {dueLabel(task.dueIn, task.statut)}
              </span>
            </>
          )}
          {task.isBlocked && (
            <>
              <span className="sep" />
              <span className="taches-blocked-info">
                <Icon name="block" size={11} /> attend « {task.blockerName} »
              </span>
            </>
          )}
        </div>
      </div>

      <div className="taches-badges">
        {task.statut === 'en cours' && <span className="tag info">en cours</span>}
        {task.priorite !== 'secondaire' && (
          <span className={`tag ${priorityClass(task.priorite)}`}>{task.priorite}</span>
        )}
      </div>

      <div className="taches-actions">
        {!isDone && (
          <>
            <button
              className="btn-do"
              onClick={() => !task.isBlocked && onValidate(task.id)}
              disabled={task.isBlocked}
              title={task.isBlocked ? `Attend : ${task.blockerName}` : ''}
            >
              <Icon name="check" size={12} /> Valider
            </button>
            <button className="btn-later" onClick={() => onLater(task.id)}>
              Plus tard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TachesPage() {
  const {
    state,
    result,
    toast,
    scenarioKey,
    onValidate,
    onLater,
    changeScenario,
    resetScenario,
  } = useKlaro();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [group, setGroup] = useState<GroupKey>('metier');

  const analyzed = useMemo(() => analyze(state.tasks), [state.tasks]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'todo':
        return analyzed.filter((t) => t.statut === 'à faire');
      case 'doing':
        return analyzed.filter((t) => t.statut === 'en cours');
      case 'done':
        return analyzed.filter((t) => t.statut === 'terminé');
      default:
        return analyzed;
    }
  }, [analyzed, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, AnalyzedTask[]>();
    filtered.forEach((t) => {
      const key = group === 'metier' ? t.metier : t.statut;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    if (group === 'status') {
      const order = ['en cours', 'à faire', 'terminé'];
      return Array.from(map.entries()).sort(
        (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
      );
    }
    return Array.from(map.entries());
  }, [filtered, group]);

  const stats = useMemo(() => ({
    total: state.tasks.length,
    todo: state.tasks.filter((t) => t.statut === 'à faire').length,
    doing: state.tasks.filter((t) => t.statut === 'en cours').length,
    done: state.tasks.filter((t) => t.statut === 'terminé').length,
    blocked: analyzed.filter((t) => t.isBlocked).length,
  }), [state.tasks, analyzed]);

  return (
    <div className="app-shell">
      <Sidebar alertCount={result.alerts.length} />

      <div className="kb-content">
        <Topbar
          title="Tâches"
          project={`${state.project.nom} · ${state.project.lieu} · ${state.project.jour}`}
        />

        <div className="kb-main">
          <div className="taches-stats-card">
            <div className="taches-stat">
              <div className="v">{stats.total}</div>
              <div className="l">total</div>
            </div>
            <div className="taches-stat warn">
              <div className="v">{stats.todo}</div>
              <div className="l">à faire</div>
            </div>
            {stats.doing > 0 && (
              <div className="taches-stat info">
                <div className="v">{stats.doing}</div>
                <div className="l">en cours</div>
              </div>
            )}
            <div className="taches-stat success">
              <div className="v">{stats.done}</div>
              <div className="l">finies</div>
            </div>
            {stats.blocked > 0 && (
              <div className="taches-stat danger">
                <div className="v">{stats.blocked}</div>
                <div className="l">bloquées</div>
              </div>
            )}
          </div>

          <div className="taches-controls">
            <div className="taches-control-group">
              <span className="taches-control-label">Filtrer</span>
              <button className={`taches-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                Toutes
              </button>
              <button className={`taches-chip ${filter === 'todo' ? 'active' : ''}`} onClick={() => setFilter('todo')}>
                À faire
              </button>
              {stats.doing > 0 && (
                <button className={`taches-chip ${filter === 'doing' ? 'active' : ''}`} onClick={() => setFilter('doing')}>
                  En cours
                </button>
              )}
              <button className={`taches-chip ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>
                Finies
              </button>
            </div>

            <div className="taches-control-group">
              <span className="taches-control-label">Grouper</span>
              <button className={`taches-chip ${group === 'metier' ? 'active' : ''}`} onClick={() => setGroup('metier')}>
                Par métier
              </button>
              <button className={`taches-chip ${group === 'status' ? 'active' : ''}`} onClick={() => setGroup('status')}>
                Par statut
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <h3>Aucune tâche dans ce filtre</h3>
              <p>Essayez un autre filtre ou changez de scénario.</p>
            </div>
          ) : (
            groups.map(([key, tasks]) => (
              <section key={key} className="taches-group">
                <header className="taches-group-head">
                  <h3>{key}</h3>
                  <span className="taches-group-count">
                    {tasks.length} tâche{tasks.length > 1 ? 's' : ''}
                  </span>
                </header>
                <div className="taches-list">
                  {tasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      onValidate={onValidate}
                      onLater={onLater}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <div className="mobile-nav">
        <MobileNav alertCount={result.alerts.length} />
      </div>

      <ScenarioPanel
        current={scenarioKey}
        onChange={changeScenario}
        onReset={resetScenario}
      />

      {toast && <Toast message={toast} />}
    </div>
  );
}
