'use client';

import { Check, Clock } from 'lucide-react';

// 4 états canoniques d'une tâche dans le contexte d'une sélection.
// L'onboarding utilise `selectionnee_non_commencee` (cochée) et `disponible` (décochée).
export type TacheCardState =
  | 'selectionnee_non_commencee'  // checkbox cochée, retirable (toggle off possible)
  | 'selectionnee_en_cours'       // grisée, badge "En cours", non-retirable
  | 'selectionnee_terminee'       // grisée, badge "✓ Terminée", non-retirable
  | 'disponible';                 // checkbox décochée, ajoutable

interface Props {
  state: TacheCardState;
  label: string;
  // Toggle d'ajout/retrait. Inactif si state est `selectionnee_en_cours` ou `selectionnee_terminee`.
  onToggle?: () => void;
  // Métadonnées optionnelles affichées en discret (durée estimée, blocage…).
  isBlocking?: boolean;
  // Durée formatée à afficher (ex. "1h30", "2 j"). Le calcul est fait par le caller
  // depuis duree_reference_minutes + coef niveau.
  dureeAffichee?: string;
}

const STATE_DOC: Record<TacheCardState, { checked: boolean; locked: boolean; badge?: string }> = {
  selectionnee_non_commencee: { checked: true, locked: false },
  selectionnee_en_cours: { checked: true, locked: true, badge: 'En cours' },
  selectionnee_terminee: { checked: true, locked: true, badge: '✓ Terminée' },
  disponible: { checked: false, locked: false },
};

export default function TacheCard({ state, label, onToggle, isBlocking, dureeAffichee }: Props) {
  const { checked, locked, badge } = STATE_DOC[state];

  return (
    <label className={`ck-tache ${checked ? 'is-on' : ''} ${locked ? 'is-locked' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={() => {
          if (!locked && onToggle) onToggle();
        }}
      />
      <span className="ck-tache-box" aria-hidden>
        {checked && (
          <Check size={12} strokeWidth={3} />
        )}
      </span>

      <span className="ck-tache-text">
        <span className="ck-tache-label">{label}</span>
        {(dureeAffichee || isBlocking || badge) && (
          <span className="ck-tache-meta">
            {dureeAffichee && (
              <span className="ck-tache-duree">
                <Clock size={11} />
                {dureeAffichee}
              </span>
            )}
            {isBlocking && <span className="ck-tache-tag">Critique</span>}
            {badge && <span className={`ck-tache-badge state-${state}`}>{badge}</span>}
          </span>
        )}
      </span>
    </label>
  );
}
