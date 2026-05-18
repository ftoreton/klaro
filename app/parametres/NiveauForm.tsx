'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { NIVEAUX, NIVEAU_LABEL, type NiveauUtilisateur } from '@/lib/niveau/types';
import { setNiveau } from '@/lib/niveau/actions';

interface Props {
  currentNiveau: NiveauUtilisateur | null;
  isOnboarding: boolean;
}

export default function NiveauForm({ currentNiveau, isOnboarding }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<NiveauUtilisateur | null>(currentNiveau);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = selected !== null && selected !== currentNiveau;

  const onSubmit = () => {
    if (!selected || !dirty) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await setNiveau(selected);
        if (isOnboarding) {
          router.push('/dashboard');
        } else {
          setSaved(true);
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Enregistrement échoué. Réessayez.');
      }
    });
  };

  return (
    <div className="pa-niveau-form">
      <div className="pa-cards">
        {NIVEAUX.map((key) => {
          const { titre, description } = NIVEAU_LABEL[key];
          const active = selected === key;
          const current = currentNiveau === key;
          return (
            <button
              key={key}
              type="button"
              className={`pa-card ${active ? 'is-active' : ''}`}
              onClick={() => {
                setSelected(key);
                setSaved(false);
              }}
              aria-pressed={active}
            >
              <span className="pa-card-titre">{titre}</span>
              <span className="pa-card-desc">{description}</span>
              {current && (
                <span className="pa-card-current">
                  <Check size={12} strokeWidth={3} />
                  Actuel
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <div className="pa-error" role="alert">{error}</div>}
      {saved && !error && (
        <div className="pa-saved" role="status">
          <Check size={14} strokeWidth={3} />
          Enregistré.
        </div>
      )}

      <div className="pa-actions">
        <button
          type="button"
          className="pa-btn pa-btn-primary"
          disabled={!selected || !dirty || pending}
          onClick={onSubmit}
        >
          {pending ? 'Enregistrement…' : isOnboarding ? 'Continuer vers le dashboard' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
