'use client';

import { Calendar, Camera, Check, ChevronRight } from 'lucide-react';
import { useMetierStore } from '@/lib/metier/store';
import type { Etape, ModeUtilisateur } from '@/lib/metier/types';
import CriticiteBadge from './CriticiteBadge';

interface Props {
  metierId: string;
  etape: Etape;
  index: number;
  mode: ModeUtilisateur;
  onOpen: (etapeId: string) => void;
}

function statutLabel(statut: Etape['statut']) {
  if (statut === 'done') return 'Terminée';
  if (statut === 'in_progress') return 'En cours';
  return 'À faire';
}

export default function EtapeCard({ metierId, etape, index, mode, onOpen }: Props) {
  const setStatut = useMetierStore((s) => s.setStatut);

  // En mode expert : titre technique, sinon titre simple
  const title = mode === 'expert' ? etape.titre_technique : etape.titre_simple;

  function handleToggleDone(e: React.MouseEvent) {
    e.stopPropagation();
    if (etape.statut === 'done') {
      setStatut(metierId, etape.id, 'todo');
    } else {
      setStatut(metierId, etape.id, 'done');
    }
  }

  function handlePlan(e: React.MouseEvent) {
    e.stopPropagation();
    onOpen(etape.id);
  }

  function handlePhoto(e: React.MouseEvent) {
    e.stopPropagation();
    onOpen(etape.id);
  }

  return (
    <article
      className={`mt-etape-card status-${etape.statut} crit-${etape.niveau_criticite}`}
      onClick={() => onOpen(etape.id)}
    >
      <div className="mt-etape-num">{String(index + 1).padStart(2, '0')}</div>

      <div className="mt-etape-body">
        <div className="mt-etape-head">
          <h3 className="mt-etape-title">{title}</h3>
          <CriticiteBadge niveau={etape.niveau_criticite} />
        </div>

        <p className="mt-etape-resume">{etape.resume_simple}</p>

        <div className="mt-etape-meta">
          <span className={`mt-etape-statut statut-${etape.statut}`}>
            <span className="mt-statut-dot" />
            {statutLabel(etape.statut)}
          </span>
          {etape.date_planifiee && (
            <span className="mt-etape-date">
              <Calendar size={12} />
              {new Date(etape.date_planifiee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {etape.photos.length > 0 && (
            <span className="mt-etape-photos">
              <Camera size={12} />
              {etape.photos.length}
            </span>
          )}
        </div>
      </div>

      <div className="mt-etape-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="mt-icon-btn"
          aria-label="Planifier"
          onClick={handlePlan}
        >
          <Calendar size={16} />
        </button>
        <button
          type="button"
          className="mt-icon-btn"
          aria-label="Ajouter une photo"
          onClick={handlePhoto}
        >
          <Camera size={16} />
        </button>
        <button
          type="button"
          className={`mt-check-btn${etape.statut === 'done' ? ' is-done' : ''}`}
          aria-label={etape.statut === 'done' ? 'Marquer comme à faire' : 'Marquer comme terminée'}
          onClick={handleToggleDone}
        >
          <Check size={16} strokeWidth={3} />
        </button>
        <ChevronRight size={16} className="mt-etape-chevron" />
      </div>
    </article>
  );
}
