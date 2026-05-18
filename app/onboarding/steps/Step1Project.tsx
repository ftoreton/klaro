'use client';

import { PROJECT_TYPES, type ProjectType } from '@/data/onboarding/trades';

type Props = {
  firstName: string | null;
  name: string;
  type: ProjectType | null;
  onName: (n: string) => void;
  onType: (t: ProjectType) => void;
};

export default function Step1Project({ firstName, name, type, onName, onType }: Props) {
  return (
    <section className="ob-step">
      <h1 className="ob-h1">
        {firstName ? `Bienvenue ${firstName} 👋` : 'Bienvenue sur Klaro 👋'}
      </h1>
      <p className="ob-sub">
        On commence par le plus simple : ton projet en quelques mots.
      </p>

      <label className="ob-field">
        <span className="ob-label">Nom de ton chantier</span>
        <input
          type="text"
          className="ob-input"
          placeholder="Rénovation maison familiale"
          value={name}
          onChange={(e) => onName(e.target.value)}
          maxLength={120}
          autoFocus
        />
      </label>

      <div className="ob-block">
        <span className="ob-label">Type de projet</span>
        <div className="ob-cards">
          {PROJECT_TYPES.map((p) => {
            const active = type === p.key;
            return (
              <button
                key={p.key}
                type="button"
                className={`ob-card ${active ? 'is-active' : ''}`}
                onClick={() => onType(p.key)}
                aria-pressed={active}
              >
                <span className="ob-card-icon">{p.icon}</span>
                <span className="ob-card-label">{p.label}</span>
                <span className="ob-card-sub">{p.sub}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
