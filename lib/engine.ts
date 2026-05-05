import type { Task, Devis, Alert, Blockage, ScoredTask, ProjectScore, ComputeResult } from './types';

const IMMINENT_DAYS = 3;

function isOverdue(t: Task): boolean {
  return t.statut !== 'terminé' && t.dueIn < 0;
}
function isToday(t: Task): boolean {
  return t.statut !== 'terminé' && t.dueIn === 0;
}
function isDone(t: Task): boolean {
  return t.statut === 'terminé';
}

function hasUnmetDeps(task: Task, allTasks: Task[]): boolean {
  if (!task.depends?.length) return false;
  if (task.statut === 'terminé') return false;
  return task.depends.some((depId) => {
    const dep = allTasks.find((t) => t.id === depId);
    return dep && dep.statut !== 'terminé';
  });
}

function isBlocked(task: Task, allTasks: Task[]): boolean {
  if (!hasUnmetDeps(task, allTasks)) return false;
  if (task.dueIn <= IMMINENT_DAYS) return true;
  return (task.depends || []).some((id) => {
    const d = allTasks.find((x) => x.id === id);
    return d && d.statut !== 'terminé' && d.dueIn < 0;
  });
}

function isBlocker(task: Task, allTasks: Task[]): boolean {
  if (task.statut === 'terminé') return false;
  return allTasks.some(
    (t) => t.statut !== 'terminé' && t.depends && t.depends.includes(task.id)
  );
}

function blockerName(task: Task, allTasks: Task[]): string | null {
  const dep = (task.depends || [])
    .map((id) => allTasks.find((t) => t.id === id))
    .find((t) => t && t.statut !== 'terminé');
  return dep ? dep.nom : null;
}

function scoreTask(t: Task, allTasks: Task[]): number {
  let s = 0;
  if (isBlocker(t, allTasks)) s += 50;
  if (isOverdue(t)) s += 30;
  if (isToday(t)) s += 20;
  if (t.priorite === 'critique') s += 15;
  if (t.priorite === 'secondaire') s -= 20;
  if (t.depends?.length) {
    const allDepsDone = t.depends.every((id) => {
      const d = allTasks.find((x) => x.id === id);
      return d && d.statut === 'terminé';
    });
    if (allDepsDone) s += 10;
  }
  return s;
}

function topTasks(allTasks: Task[], n = 3): ScoredTask[] {
  const candidates: ScoredTask[] = allTasks
    .filter((t) => t.statut !== 'terminé')
    .filter((t) => !hasUnmetDeps(t, allTasks))
    .map((t) => ({
      ...t,
      _score: scoreTask(t, allTasks),
      _blocker: isBlocker(t, allTasks),
      _overdue: isOverdue(t),
    }));

  candidates.sort((a, b) => b._score - a._score);

  const picks = candidates.slice(0, n);
  const hasCritique = picks.some((t) => t.priorite === 'critique');
  if (!hasCritique) {
    const critique = candidates.find(
      (t) => t.priorite === 'critique' && !picks.includes(t)
    );
    if (critique) picks[picks.length - 1] = critique;
  }
  return picks;
}

function blockages(allTasks: Task[]): Blockage[] {
  return allTasks
    .filter((t) => isBlocked(t, allTasks))
    .map((t) => ({
      task: t,
      blockedBy: blockerName(t, allTasks),
      message: `${t.nom} impossible → ${blockerName(t, allTasks)} non terminé`,
    }));
}

function buildAlerts(allTasks: Task[], devis: Devis[] = []): Alert[] {
  const alerts: Alert[] = [];

  devis.filter((d) => !d.signe).forEach((d) => {
    alerts.push({
      id: `devis-${d.id}`,
      type: 'devis',
      score: 50,
      titre: `Signer le devis ${d.metier}`,
      explication: `Sans signature, chantier bloqué ${d.bloqueLe || 'lundi'}. Reçu il y a ${d.recuDepuis} jours.`,
      meta: { fichier: d.fichier, montant: d.montant, artisan: d.artisan },
      actions: ['Signer', 'Contacter', 'Plus tard'],
    });
  });

  blockages(allTasks).forEach((b) => {
    alerts.push({
      id: `blocage-${b.task.id}`,
      type: 'blocage',
      score: 50,
      titre: `Blocage — ${b.task.nom}`,
      explication: `Impossible de démarrer tant que « ${b.blockedBy} » n'est pas terminé.`,
      meta: { taskId: b.task.id, blockedBy: b.blockedBy ?? undefined },
      actions: ['Voir détails', 'Contacter', 'Plus tard'],
    });
  });

  allTasks.filter((t) => isOverdue(t) && t.dueIn <= -2).forEach((t) => {
    alerts.push({
      id: `retard-${t.id}`,
      type: 'retard',
      score: 30 + Math.min(20, Math.abs(t.dueIn) * 2),
      titre: `Retard — ${t.nom}`,
      explication: `${Math.abs(t.dueIn)} jours de retard${t.artisan ? ` · ${t.artisan}` : ''}.`,
      meta: { taskId: t.id, retardJours: Math.abs(t.dueIn) },
      actions: ['Replanifier', 'Contacter', 'Plus tard'],
    });
  });

  allTasks
    .filter((t) => t.priorite === 'critique' && t.statut !== 'terminé' && !isOverdue(t))
    .forEach((t) => {
      alerts.push({
        id: `critique-${t.id}`,
        type: 'critique',
        score: 20,
        titre: t.nom,
        explication: `Tâche critique pour la suite du chantier${t.artisan ? ` · ${t.artisan}` : ''}.`,
        meta: { taskId: t.id },
        actions: ['Faire', 'Replanifier', 'Plus tard'],
      });
    });

  alerts.sort((a, b) => b.score - a.score);
  return alerts;
}

function projectScore(allTasks: Task[], devis: Devis[] = []): ProjectScore {
  let s = 100;
  const overdue = allTasks.filter(isOverdue).length;
  const blocked = blockages(allTasks).length;
  const unassigned = allTasks.filter((t) => t.statut !== 'terminé' && !t.artisan).length;
  const done = allTasks.filter(isDone).length;
  const unsignedDevis = devis.filter((d) => !d.signe).length;

  s -= overdue * 8;
  s -= blocked * 10;
  s -= unassigned * 2;
  s -= unsignedDevis * 5;
  s += done * 2;

  s = Math.max(0, Math.min(100, s));

  let message: string;
  let tone: 'success' | 'warn' | 'danger';
  if (s >= 90) { message = 'Excellent'; tone = 'success'; }
  else if (s >= 70) { message = 'Bon avancement'; tone = 'success'; }
  else if (s >= 50) { message = 'À surveiller'; tone = 'warn'; }
  else { message = 'Chantier en difficulté'; tone = 'danger'; }

  return {
    value: Math.round(s),
    message,
    tone,
    breakdown: { overdue, blocked, unassigned, done, unsignedDevis },
  };
}

export function compute(state: { tasks: Task[]; devis: Devis[] }): ComputeResult {
  const tasks = state.tasks || [];
  const devis = state.devis || [];
  return {
    score: projectScore(tasks, devis),
    todays: topTasks(tasks, 3),
    alerts: buildAlerts(tasks, devis),
    blockages: blockages(tasks),
    stats: {
      done: tasks.filter(isDone).length,
      total: tasks.length,
      overdue: tasks.filter(isOverdue).length,
      blocked: blockages(tasks).length,
    },
  };
}
