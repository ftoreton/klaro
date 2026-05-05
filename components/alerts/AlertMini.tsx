import type { Alert } from '@/lib/types';

interface AlertMiniProps {
  alert: Alert;
}

function dotClass(score: number): string {
  if (score >= 50) return 'danger';
  if (score >= 30) return 'warn';
  return 'info';
}

export default function AlertMini({ alert }: AlertMiniProps) {
  return (
    <div className="alert-mini">
      <div className={`dot ${dotClass(alert.score)}`} />
      <div className="info">
        <div className="t">{alert.titre}</div>
        <div className="s">{alert.explication}</div>
      </div>
      <span className="arrow">→</span>
    </div>
  );
}
