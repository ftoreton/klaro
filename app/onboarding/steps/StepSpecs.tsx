'use client';

import { BUDGET_RANGES, DURATION_RANGES } from '@/data/onboarding/trades';

type Props = {
  surface: number | null;
  budgetRange: string | null;
  startDate: string | null;
  durationRange: string | null;
  onSurface: (n: number | null) => void;
  onBudget: (k: string) => void;
  onStartDate: (d: string) => void;
  onDuration: (k: string) => void;
};

export default function StepSpecs({
  surface,
  budgetRange,
  startDate,
  durationRange,
  onSurface,
  onBudget,
  onStartDate,
  onDuration,
}: Props) {
  return (
    <section className="ob-step">
      <h1 className="ob-h1">Les caractéristiques</h1>
      <p className="ob-sub">
        Ces infos servent à Klaro pour estimer durée, budget et dépendances. Tout est ajustable plus tard.
      </p>

      <label className="ob-field">
        <span className="ob-label">Surface concernée (m²)</span>
        <input
          type="number"
          className="ob-input"
          placeholder="120"
          inputMode="numeric"
          min={1}
          max={9999}
          value={surface ?? ''}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onSurface(Number.isNaN(n) ? null : n);
          }}
        />
      </label>

      <div className="ob-block">
        <span className="ob-label">Budget estimé</span>
        <div className="ob-pills">
          {BUDGET_RANGES.map((b) => (
            <button
              key={b.key}
              type="button"
              className={`ob-pill ${budgetRange === b.key ? 'is-active' : ''}`}
              onClick={() => onBudget(b.key)}
              aria-pressed={budgetRange === b.key}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <label className="ob-field">
        <span className="ob-label">Date de début prévue</span>
        <input
          type="date"
          className="ob-input"
          value={startDate ?? ''}
          onChange={(e) => onStartDate(e.target.value)}
        />
      </label>

      <div className="ob-block">
        <span className="ob-label">Durée estimée</span>
        <div className="ob-pills">
          {DURATION_RANGES.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`ob-pill ${durationRange === d.key ? 'is-active' : ''}`}
              onClick={() => onDuration(d.key)}
              aria-pressed={durationRange === d.key}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
