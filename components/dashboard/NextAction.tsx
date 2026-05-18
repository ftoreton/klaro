'use client';

import Icon from '@/components/ui/Icon';
import type { ScoredTask, Task } from '@/lib/types';

interface NextActionProps {
  task: ScoredTask;
  allTasks: Task[];
  onValidate: (id: string) => void;
  onLater: (id: string) => void;
}

export default function NextAction({ task, allTasks, onValidate, onLater }: NextActionProps) {
  const blockedCount = allTasks.filter(
    (t) => t.depends?.includes(task.id) && t.statut !== 'terminé'
  ).length;

  const dueLabel =
    task.dueIn === 0
      ? "aujourd'hui"
      : task.dueIn < 0
        ? `+${Math.abs(task.dueIn)}j retard`
        : `dans ${task.dueIn}j`;

  return (
    <div className={`next-card ${task.priorite === 'critique' ? 'danger' : ''}`}>
      <div className="eyebrow">
        <span>★</span> Klaro te recommande
      </div>
      <h2>{task.nom}</h2>

      {(task._overdue || task._blocker || task.priorite === 'critique') && (
        <p className="why">
          {task._overdue && (
            <>En retard de {Math.abs(task.dueIn)} jour{Math.abs(task.dueIn) > 1 ? 's' : ''}. </>
          )}
          {task._blocker && (
            <>
              Bloque {blockedCount} tâche{blockedCount > 1 ? 's' : ''} suivante{blockedCount > 1 ? 's' : ''}.{' '}
            </>
          )}
          {!task._overdue && !task._blocker && task.priorite === 'critique' && (
            <>Tâche critique pour la suite. </>
          )}
        </p>
      )}

      <div className="meta">
        {task.artisan && (
          <>
            <span>
              <Icon name="user" size={12} /> {task.artisan}
            </span>
            <span className="sep" />
          </>
        )}
        <span>
          <Icon name="clock" size={12} /> {dueLabel}
        </span>
        {task.metier && (
          <>
            <span className="sep" />
            <span>{task.metier}</span>
          </>
        )}
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={() => onValidate(task.id)}>
          <Icon name="check" size={14} /> Valider
        </button>
        <button className="btn btn-ghost">
          <Icon name="cam" size={14} /> Photo
        </button>
        <button className="btn btn-ghost" onClick={() => onLater(task.id)}>
          <Icon name="clock" size={14} /> Plus tard
        </button>
      </div>
    </div>
  );
}
