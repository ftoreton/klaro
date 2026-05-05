'use client';

import ScoreRing from '@/components/ui/ScoreRing';
import type { ProjectScore } from '@/lib/types';

interface ScoreCardProps {
  score: ProjectScore;
  stats: { done: number; total: number; overdue: number; blocked: number };
  alertCount: number;
}

export default function ScoreCard({ score, stats, alertCount }: ScoreCardProps) {
  const statusLabel = stats.blocked > 0
    ? `${stats.blocked} blocage${stats.blocked > 1 ? 's' : ''}`
    : score.tone === 'success'
      ? 'tout va bien'
      : 'à surveiller';

  return (
    <div className="score-card">
      <ScoreRing value={score.value} tone={score.tone} />

      <div className="score-info">
        <div className="eyebrow">Score chantier</div>
        <h3>{score.message}</h3>
        <p>
          {stats.done}/{stats.total} tâches terminées · {alertCount} alerte{alertCount > 1 ? 's' : ''} à traiter
        </p>
        <div className={`score-status ${score.tone}`}>
          <span className="pulse" />
          {statusLabel}
        </div>
      </div>

      <div className="score-stats">
        <div className="score-stat success">
          <span className="v">{stats.done}</span>
          <span className="l">finies</span>
        </div>
        <div className="score-stat warn">
          <span className="v">{stats.overdue}</span>
          <span className="l">retards</span>
        </div>
        <div className="score-stat danger">
          <span className="v">{stats.blocked}</span>
          <span className="l">blocages</span>
        </div>
      </div>
    </div>
  );
}
