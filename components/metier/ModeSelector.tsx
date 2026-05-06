'use client';

import { useMetierStore } from '@/lib/metier/store';
import type { ModeUtilisateur } from '@/lib/metier/types';

const MODES: { key: ModeUtilisateur; label: string; sub: string }[] = [
  { key: 'debutant', label: 'Débutant', sub: 'Vocabulaire simple' },
  { key: 'intermediaire', label: 'Intermédiaire', sub: 'Détails utiles' },
  { key: 'expert', label: 'Expert', sub: 'Termes & DTU' },
];

export default function ModeSelector() {
  const mode = useMetierStore((s) => s.mode);
  const setMode = useMetierStore((s) => s.setMode);

  return (
    <div className="mt-modes" role="radiogroup" aria-label="Mode utilisateur">
      {MODES.map((m) => (
        <button
          key={m.key}
          type="button"
          role="radio"
          aria-checked={mode === m.key}
          className={`mt-mode${mode === m.key ? ' is-active' : ''}`}
          onClick={() => setMode(m.key)}
        >
          <span className="mt-mode-label">{m.label}</span>
          <span className="mt-mode-sub">{m.sub}</span>
        </button>
      ))}
    </div>
  );
}
