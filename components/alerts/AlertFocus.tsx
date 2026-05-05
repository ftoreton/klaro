'use client';

import Icon from '@/components/ui/Icon';
import type { Alert } from '@/lib/types';

interface AlertFocusProps {
  alert: Alert;
  totalCount: number;
  onValidate: (id: string) => void;
  onLater: (id: string) => void;
}

export default function AlertFocus({ alert, totalCount, onValidate, onLater }: AlertFocusProps) {
  const isDanger = alert.score >= 50;
  const progressPct = Math.round((1 / totalCount) * 100);

  return (
    <div className={`alert-focus ${isDanger ? 'danger' : 'warn'}`}>
      <div className="alert-progress">
        <div className="bar" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="priority">
        <Icon name="warn" size={11} />
        ★ Priorité Klaro · 1 / {totalCount}
      </div>

      <h2>{alert.titre}</h2>
      <p className="why">{alert.explication}</p>

      {alert.meta?.fichier && (
        <div className="meta-card">
          <div className="ic">
            <Icon name="doc" size={15} />
          </div>
          <div className="info">
            <div className="f">{String(alert.meta.fichier)}</div>
            <div className="s">
              {alert.meta.montant} · {alert.meta.artisan}
            </div>
          </div>
          <button
            style={{
              padding: '5px 10px',
              fontSize: 11,
              color: 'var(--fg-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            voir →
          </button>
        </div>
      )}

      <div className="actions">
        <button className="btn btn-primary" onClick={() => onValidate(alert.id)}>
          <Icon name="check" size={14} /> {alert.actions[0]}
        </button>
        <button className="btn btn-secondary">
          <Icon name="phone" size={13} /> Contacter
        </button>
        <button className="btn btn-ghost" onClick={() => onLater(alert.id)}>
          <Icon name="clock" size={13} /> Plus tard
        </button>
      </div>
    </div>
  );
}
