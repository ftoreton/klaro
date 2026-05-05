'use client';

import { useState, useEffect } from 'react';
import type { ScoreTone } from '@/lib/types';

const COLORS: Record<ScoreTone, string> = {
  success: 'var(--accent)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
};

interface ScoreRingProps {
  value: number;
  size?: number;
  strokeW?: number;
  tone?: ScoreTone;
}

export default function ScoreRing({ value, size = 110, strokeW = 9, tone = 'success' }: ScoreRingProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let raf: number;
    let t0: number | null = null;
    const dur = 900;

    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const r = (size - strokeW) / 2;
  const c = 2 * Math.PI * r;
  const dash = (animated / 100) * c;

  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-2)" strokeWidth={strokeW} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={COLORS[tone]}
          strokeWidth={strokeW}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="num">
        <span className="v">{animated}</span>
        <span className="d">/ 100</span>
      </div>
    </div>
  );
}
