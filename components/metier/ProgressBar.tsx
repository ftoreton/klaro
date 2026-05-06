'use client';

interface Props {
  done: number;
  total: number;
  pct: number;
}

export default function ProgressBar({ done, total, pct }: Props) {
  return (
    <div className="mt-progress">
      <div className="mt-progress-info">
        <span className="mt-progress-label">Progression</span>
        <span className="mt-progress-count">
          {done} / {total} étapes terminées
        </span>
      </div>
      <div className="mt-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="mt-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
