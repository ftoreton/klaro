'use client';

import { useEffect, useRef } from 'react';
import { AlertOctagon, Calendar, Camera, Check, Lightbulb, Package, X } from 'lucide-react';
import { useMetierStore } from '@/lib/metier/store';
import type { Etape, ModeUtilisateur } from '@/lib/metier/types';
import { hiddenSousTachesCount, visibleSousTaches } from '@/lib/metier/progress';
import AnnotatedText from './AnnotatedText';
import SousTacheItem from './SousTacheItem';
import BlocTechnique from './BlocTechnique';
import CriticiteBadge from './CriticiteBadge';

interface Props {
  metierId: string;
  etape: Etape | null;
  mode: ModeUtilisateur;
  onClose: () => void;
}

export default function EtapeDetailDrawer({ metierId, etape, mode, onClose }: Props) {
  const toggleSousTache = useMetierStore((s) => s.toggleSousTache);
  const setStatut = useMetierStore((s) => s.setStatut);
  const setDate = useMetierStore((s) => s.setDate);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Echap pour fermer
  useEffect(() => {
    if (!etape) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [etape, onClose]);

  // Bloque le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (etape) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [etape]);

  if (!etape) return null;

  const visible = visibleSousTaches(etape.sous_taches, mode);
  const hidden = hiddenSousTachesCount(etape.sous_taches, mode);
  const title = mode === 'expert' ? etape.titre_technique : etape.titre_simple;

  return (
    <div className="mt-drawer-root">
      <div className="mt-drawer-overlay" onClick={onClose} aria-hidden="true" />

      <aside
        className={`mt-drawer crit-${etape.niveau_criticite}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <header className="mt-drawer-head">
          <div className="mt-drawer-head-meta">
            <CriticiteBadge niveau={etape.niveau_criticite} />
            {mode !== 'expert' && etape.titre_technique !== etape.titre_simple && (
              <span className="mt-drawer-tech-name">{etape.titre_technique}</span>
            )}
          </div>
          <button type="button" className="mt-drawer-close" aria-label="Fermer" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="mt-drawer-body">
          <h2 id="drawer-title" className="mt-drawer-title">{title}</h2>

          {/* Bandeau critique */}
          {etape.niveau_criticite === 'critique' && (
            <div className="mt-critique-banner" role="alert">
              <AlertOctagon size={20} />
              <div>
                <strong>Étape critique.</strong>
                <span>Une erreur ici peut entraîner des dégâts, surcoûts ou reprises importantes.</span>
              </div>
            </div>
          )}

          {/* Résumé */}
          <section className="mt-drawer-section">
            <h3 className="mt-drawer-section-title">En quoi ça consiste</h3>
            <AnnotatedText
              as="p"
              className="mt-drawer-text"
              text={etape.resume_simple}
              termes={etape.termes_techniques}
            />
          </section>

          {/* Pourquoi c'est important */}
          <section className="mt-drawer-section">
            <h3 className="mt-drawer-section-title">Pourquoi c'est important</h3>
            <AnnotatedText
              as="p"
              className="mt-drawer-text"
              text={etape.pourquoi_important}
              termes={etape.termes_techniques}
            />
          </section>

          {/* Sous-tâches */}
          {visible.length > 0 && (
            <section className="mt-drawer-section">
              <h3 className="mt-drawer-section-title">Étapes à cocher</h3>
              <ul className="mt-st-list">
                {visible.map((st) => (
                  <SousTacheItem
                    key={st.id}
                    sousTache={st}
                    termes={etape.termes_techniques}
                    onToggle={() => toggleSousTache(metierId, etape.id, st.id)}
                  />
                ))}
              </ul>
              {hidden > 0 && (
                <p className="mt-st-hint">
                  {hidden} sous-tâche{hidden > 1 ? 's' : ''} supplémentaire{hidden > 1 ? 's' : ''} disponible
                  {hidden > 1 ? 's' : ''} en mode <strong>Intermédiaire</strong> ou <strong>Expert</strong>.
                </p>
              )}
            </section>
          )}

          {/* Recommandations simples (Klaro vous recommande) */}
          {etape.recommandations_simples.length > 0 && (
            <section className="mt-drawer-section">
              <h3 className="mt-drawer-section-title">
                <Lightbulb size={16} />
                Klaro te recommande
              </h3>
              <ul className="mt-tip-list">
                {etape.recommandations_simples.map((r, i) => (
                  <li key={i}>
                    <AnnotatedText text={r} termes={etape.termes_techniques} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Erreurs fréquentes */}
          {etape.erreurs_frequentes.length > 0 && (
            <section className="mt-drawer-section">
              <h3 className="mt-drawer-section-title">Erreurs fréquentes à éviter</h3>
              <ul className="mt-err-list">
                {etape.erreurs_frequentes.map((er, i) => (
                  <li key={i}>
                    <AnnotatedText text={er} termes={etape.termes_techniques} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Matériel conseillé */}
          {etape.materiel_conseille && etape.materiel_conseille.length > 0 && (
            <section className="mt-drawer-section">
              <h3 className="mt-drawer-section-title">
                <Package size={16} />
                Matériel conseillé
              </h3>
              <ul className="mt-mat-list">
                {etape.materiel_conseille.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </section>
          )}

          {/* Bloc technique (niveau 3) */}
          <BlocTechnique etape={etape} mode={mode} />
        </div>

        {/* Footer actions */}
        <footer className="mt-drawer-footer">
          <div className="mt-drawer-actions">
            <label className="mt-drawer-action-btn">
              <Calendar size={16} />
              <span>{etape.date_planifiee ? 'Modifier la date' : 'Planifier'}</span>
              <input
                type="date"
                value={etape.date_planifiee ?? ''}
                onChange={(e) => setDate(metierId, etape.id, e.target.value || null)}
              />
            </label>

            <button
              type="button"
              className="mt-drawer-action-btn"
              onClick={() => alert('Pris en compte. Système d\'upload photo à venir.')}
            >
              <Camera size={16} />
              <span>Ajouter photo</span>
            </button>

            <button
              type="button"
              className={`mt-drawer-validate${etape.statut === 'done' ? ' is-done' : ''}`}
              onClick={() =>
                setStatut(metierId, etape.id, etape.statut === 'done' ? 'todo' : 'done')
              }
            >
              <Check size={16} strokeWidth={3} />
              {etape.statut === 'done' ? 'Marquée terminée' : 'Marquer comme terminée'}
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
