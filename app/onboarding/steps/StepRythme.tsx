'use client';

import { RYTHMES, RYTHME_LABEL } from '@/lib/estimation/constants';
import type { Rythme } from '@/lib/estimation/types';

type Props = {
  rythme: Rythme | null;
  onPick: (r: Rythme) => void;
};

export default function StepRythme({ rythme, onPick }: Props) {
  return (
    <section className="ob-step">
      <h1 className="ob-h1">À quel rythme comptes-tu avancer ?</h1>
      <p className="ob-sub">
        Klaro adapte l&apos;estimation de délai à ta cadence réelle. Modifiable à tout moment depuis la page Estimation.
      </p>

      <div className="ob-block">
        <div className="ob-cards">
          {RYTHMES.map((key) => {
            const { titre, description } = RYTHME_LABEL[key];
            const active = rythme === key;
            return (
              <button
                key={key}
                type="button"
                className={`ob-card ${active ? 'is-active' : ''}`}
                onClick={() => onPick(key)}
                aria-pressed={active}
              >
                <span className="ob-card-label">{titre}</span>
                <span className="ob-card-sub">{description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
