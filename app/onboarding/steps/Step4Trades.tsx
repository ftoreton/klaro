'use client';

import { TRADES_META, type TradeKey } from '@/data/onboarding/trades';
import type { LoadedTrade } from '@/lib/onboarding/loader';

type Props = {
  trades: Record<TradeKey, LoadedTrade>;
  selected: TradeKey[];
  onToggle: (key: TradeKey, on: boolean) => void;
};

export default function Step4Trades({ trades, selected, onToggle }: Props) {
  return (
    <section className="ob-step">
      <h1 className="ob-h1">Les corps de métier</h1>
      <p className="ob-sub">
        Klaro a présélectionné les métiers concernés selon votre type de projet. Décochez ce qui ne vous concerne pas.
      </p>

      <div className="ob-trades">
        {TRADES_META.map((meta) => {
          const active = selected.includes(meta.key);
          const count = trades[meta.key]?.totalTasks ?? 0;
          return (
            <button
              key={meta.key}
              type="button"
              className={`ob-trade ${active ? 'is-active' : ''}`}
              onClick={() => onToggle(meta.key, !active)}
              aria-pressed={active}
            >
              <span className="ob-trade-icon">{meta.icon}</span>
              <span className="ob-trade-text">
                <span className="ob-trade-label">{meta.label}</span>
                <span className="ob-trade-tasks">{count} tâches</span>
              </span>
              <span className="ob-trade-check" aria-hidden>
                {active ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="ob-trades-count">
        {selected.length} métier{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
      </div>
    </section>
  );
}
