'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Wrench } from 'lucide-react';
import type { Etape, ModeUtilisateur } from '@/lib/metier/types';
import AnnotatedText from './AnnotatedText';

interface Props {
  etape: Etape;
  mode: ModeUtilisateur;
}

export default function BlocTechnique({ etape, mode }: Props) {
  // Replié par défaut, sauf en mode expert
  const [open, setOpen] = useState(mode === 'expert');

  // Si l'utilisateur passe en/hors mode expert pendant qu'il est dans le drawer,
  // on synchronise l'état d'ouverture du bloc.
  useEffect(() => {
    setOpen(mode === 'expert');
  }, [mode]);

  if (etape.recommandations_techniques_DTU.length === 0) return null;

  return (
    <section className={`mt-bloc-technique${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="mt-bloc-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Wrench size={14} />
        <span className="mt-bloc-toggle-label">
          {open ? 'Masquer les recommandations techniques' : 'Voir les recommandations techniques'}
        </span>
        <ChevronDown size={16} className={`mt-bloc-chevron${open ? ' is-open' : ''}`} />
      </button>

      {open && (
        <div className="mt-bloc-content">
          <div className="mt-bloc-tag">Zone experte · DTU & normes</div>
          <ul className="mt-bloc-list">
            {etape.recommandations_techniques_DTU.map((dtu, i) => (
              <li key={i}>
                <AnnotatedText text={dtu} termes={etape.termes_techniques} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
