'use client';

import { TRADES_META, type TradeKey } from '@/data/onboarding/trades';
import type { LoadedTrade } from '@/lib/onboarding/loader';
import MetierCard from '@/components/chantier/MetierCard';
import '@/components/chantier/chantier.css';

type Props = {
  trades: Record<TradeKey, LoadedTrade>;
  selected: TradeKey[];
  onToggle: (key: TradeKey, on: boolean) => void;
};

export default function StepTrades({ trades, selected, onToggle }: Props) {
  return (
    <section className="ob-step">
      <h1 className="ob-h1">Les corps de métier</h1>
      <p className="ob-sub">
        Klaro a présélectionné les métiers concernés selon ton type de projet. Décoche ce qui ne te concerne pas.
      </p>

      <div className="ob-trades">
        {TRADES_META.map((meta) => {
          const active = selected.includes(meta.key);
          const totalTasks = trades[meta.key]?.totalTasks ?? 0;
          // Au stade onboarding, le contexte "payé / upgrade" n'existe pas :
          // sélectionner = `actif_paye_avec_taches`, désélectionner = `disponible_sans_upgrade`.
          // Le click sur la carte toggle la sélection (sémantique onboarding).
          return (
            <MetierCard
              key={meta.key}
              meta={meta}
              state={active ? 'actif_paye_avec_taches' : 'disponible_sans_upgrade'}
              activeTaskCount={active ? totalTasks : undefined}
              totalTaskCount={totalTasks}
              onClick={() => onToggle(meta.key, !active)}
            />
          );
        })}
      </div>

      <div className="ob-trades-count">
        {selected.length} métier{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
      </div>
    </section>
  );
}
