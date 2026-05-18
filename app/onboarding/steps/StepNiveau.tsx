'use client';

import { NIVEAUX, NIVEAU_LABEL, type NiveauUtilisateur } from '@/lib/niveau/types';

type Props = {
  niveau: NiveauUtilisateur | null;
  onPick: (n: NiveauUtilisateur) => void;
};

export default function StepNiveau({ niveau, onPick }: Props) {
  return (
    <section className="ob-step">
      <h1 className="ob-h1">Ton niveau en bricolage</h1>
      <p className="ob-sub">
        On adapte le contenu et les estimations de durée à ton expérience. Modifiable à tout moment dans tes paramètres.
      </p>

      <div className="ob-block">
        <div className="ob-cards">
          {NIVEAUX.map((key) => {
            const { titre, description } = NIVEAU_LABEL[key];
            const active = niveau === key;
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
