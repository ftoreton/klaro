'use client';

import Icon from '@/components/ui/Icon';
import type { ScoredTask, Task } from '@/lib/types';

interface TasksListProps {
  tasks: ScoredTask[];
  allTasks: Task[];
  pendingCount: number;
  onValidate: (id: string) => void;
  onLater: (id: string) => void;
}

function priorityClass(p: string): string {
  if (p === 'critique') return 'danger';
  if (p === 'important') return 'warn';
  return '';
}

export default function TasksList({ tasks, allTasks: _allTasks, pendingCount, onValidate, onLater }: TasksListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="tasks-list">
      <div className="tasks-head">
        <h3>Aussi pour vous aujourd&apos;hui</h3>
        <span className="sub">· Klaro priorise</span>
        <span className="more">+ {Math.max(0, pendingCount - 1 - tasks.length)} cette semaine</span>
      </div>

      {tasks.map((task, i) => (
        <div key={task.id} className="task-row">
          <span className="task-num">{i + 2}</span>

          <div className="task-info">
            <span className="task-name">{task.nom}</span>
            <span className="task-why">
              {task._blocker && (
                <><span className="why-arrow">→</span> bloque la suite</>
              )}
              {!task._blocker && task._overdue && (
                <><span className="why-arrow">→</span> en retard de {Math.abs(task.dueIn)}j</>
              )}
              {!task._blocker && !task._overdue && task.dueIn === 0 && (
                <><span className="why-arrow">→</span> prévu aujourd&apos;hui</>
              )}
              {!task._blocker && !task._overdue && task.dueIn > 0 && (
                <><span className="why-arrow">→</span> dans {task.dueIn}j</>
              )}
              {task.artisan && <span className="tag">{task.artisan}</span>}
            </span>
          </div>

          <span className={`tag ${priorityClass(task.priorite)}`}>{task.priorite}</span>

          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-do" onClick={() => onValidate(task.id)}>
              <Icon name="check" size={12} /> Faire
            </button>
            <button className="btn-later" onClick={() => onLater(task.id)}>Plus tard</button>
          </div>
        </div>
      ))}
    </div>
  );
}
