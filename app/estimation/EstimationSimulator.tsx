'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Info, Settings, Settings2 } from 'lucide-react';
import { calculerEstimation } from '@/lib/estimation/calculate';
import { RYTHMES, RYTHME_LABEL } from '@/lib/estimation/constants';
import { updateProjectRythme } from '@/lib/estimation/actions';
import type { EstimationTache, Rythme } from '@/lib/estimation/types';
import { NIVEAUX, NIVEAU_LABEL, type NiveauUtilisateur } from '@/lib/niveau/types';

interface Props {
  projectId: string;
  initialRythme: Rythme;
  currentNiveau: NiveauUtilisateur;
  taches: EstimationTache[];
}

export default function EstimationSimulator({
  projectId,
  initialRythme,
  currentNiveau,
  taches,
}: Props) {
  const router = useRouter();
  const [rythme, setRythme] = useState<Rythme>(initialRythme);
  const [niveau, setNiveau] = useState<NiveauUtilisateur>(currentNiveau);
  const [tauxDelegationPct, setTauxDelegationPct] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Calcul pur via useMemo — re-run uniquement si paramètres changent.
  // Coût mesuré : < 1ms pour 50 tâches (cf. calculate.test.ts).
  const estimation = useMemo(
    () =>
      calculerEstimation({
        taches,
        niveau,
        rythme,
        tauxDelegation: tauxDelegationPct / 100,
      }),
    [taches, niveau, rythme, tauxDelegationPct],
  );

  const rythmeChanged = rythme !== initialRythme;
  const niveauChanged = niveau !== currentNiveau;
  const isUnavailable = estimation.confiance === 'indisponible';

  const onApplyRythme = () => {
    if (!rythmeChanged) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateProjectRythme(projectId, rythme);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sauvegarde échouée. Réessaye.');
      }
    });
  };

  return (
    <div className="est">
      <header className="est-head">
        <h1 className="est-h1">Estimation de ton chantier</h1>
        <p className="est-sub">
          Simule des changements en temps réel. Rien n&apos;est sauvegardé tant que tu n&apos;as pas cliqué sur &quot;Appliquer&quot;.
        </p>
        <div className="est-head-actions">
          <Link href="/chantier/modifier" className="est-link-action">
            <Settings2 size={14} />
            Modifier mon chantier
          </Link>
        </div>
      </header>

      {/* ─── Bloc principal : estimation actuelle ────────── */}
      <section className="est-card est-card-main">
        {isUnavailable ? (
          <div className="est-unavailable">
            <Info size={18} />
            <span>
              Estimation indisponible — Klaro affine encore les durées des métiers concernés.
            </span>
          </div>
        ) : (
          <>
            <div className="est-number">
              ~{estimation.delai_central_mois}
              <span className="est-unit">mois</span>
            </div>
            <p className="est-range">
              entre {estimation.borne_basse_mois} et {estimation.borne_haute_mois} mois selon les imprévus
            </p>
            <p className="est-work">
              Soit <strong>{Math.round(estimation.jours_travail_effectif)} jours</strong> de travail effectif à ton rythme.
            </p>
            {estimation.confiance === 'partielle' && (
              <p className="est-disclaimer">
                <Info size={14} />
                Estimation partielle — tous les métiers ne sont pas encore calibrés.
              </p>
            )}
          </>
        )}
      </section>

      {/* ─── Bloc simulations ────────────────────────────── */}
      <section className="est-card">
        <h2 className="est-h2">Simuler des changements</h2>

        {/* Rythme */}
        <div className="est-block">
          <h3 className="est-block-title">Rythme de chantier</h3>
          <div className="est-radio-grid">
            {RYTHMES.map((key) => (
              <button
                key={key}
                type="button"
                className={`est-radio ${rythme === key ? 'is-active' : ''}`}
                onClick={() => setRythme(key)}
                aria-pressed={rythme === key}
              >
                <span className="est-radio-label">{RYTHME_LABEL[key].titre}</span>
                <span className="est-radio-sub">{RYTHME_LABEL[key].description}</span>
              </button>
            ))}
          </div>
          {rythmeChanged && (
            <div className="est-apply">
              <button
                type="button"
                className="est-btn est-btn-primary"
                onClick={onApplyRythme}
                disabled={pending}
              >
                {pending ? 'Sauvegarde…' : 'Appliquer ce rythme à mon chantier'}
              </button>
            </div>
          )}
        </div>

        {/* Niveau */}
        <div className="est-block">
          <h3 className="est-block-title">Niveau bricolage</h3>
          <div className="est-radio-grid est-radio-grid-2">
            {NIVEAUX.map((key) => (
              <button
                key={key}
                type="button"
                className={`est-radio ${niveau === key ? 'is-active' : ''}`}
                onClick={() => setNiveau(key)}
                aria-pressed={niveau === key}
              >
                <span className="est-radio-label">{NIVEAU_LABEL[key].titre}</span>
                <span className="est-radio-sub">{NIVEAU_LABEL[key].description}</span>
              </button>
            ))}
          </div>
          {niveauChanged && (
            <Link href="/parametres" className="est-link-action">
              <Settings size={14} />
              Pour modifier ton niveau de façon permanente, va dans Paramètres
            </Link>
          )}
        </div>

        {/* Délégation */}
        <div className="est-block">
          <h3 className="est-block-title">Si je délègue plus de tâches à un artisan</h3>
          <p className="est-block-sub">
            Klaro priorise la délégation des tâches qu&apos;il recommande de confier à un pro.
          </p>
          <div className="est-slider">
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={tauxDelegationPct}
              onChange={(e) => setTauxDelegationPct(parseInt(e.target.value, 10))}
              aria-label="Taux de délégation"
            />
            <div className="est-slider-value">
              <strong>{tauxDelegationPct}%</strong> des tâches déléguées
            </div>
          </div>
        </div>

        {error && (
          <div className="est-error" role="alert">{error}</div>
        )}
      </section>

      {/* ─── Bloc détail collapsible ─────────────────────── */}
      <section className="est-card est-card-detail">
        <button
          type="button"
          className="est-collapse"
          onClick={() => setDetailOpen((v) => !v)}
          aria-expanded={detailOpen}
        >
          <span>Comment ce délai est-il calculé&nbsp;?</span>
          <ChevronDown size={16} className={detailOpen ? 'is-open' : ''} />
        </button>
        {detailOpen && (
          <dl className="est-detail">
            <div>
              <dt>Jours de travail effectif</dt>
              <dd>
                {estimation.jours_travail_effectif.toFixed(1)} j
                <span className="est-detail-note">
                  ({estimation.taches_avec_duree}/{estimation.total_taches} tâches calibrées, niveau {NIVEAU_LABEL[niveau].titre})
                </span>
              </dd>
            </div>
            <div>
              <dt>Délai calendaire brut</dt>
              <dd>
                {estimation.decomposition.duree_brute_jours.toFixed(1)} j
                <span className="est-detail-note">(rythme : {RYTHME_LABEL[rythme].titre})</span>
              </dd>
            </div>
            <div>
              <dt>+ Séchages incompressibles</dt>
              <dd>{estimation.decomposition.sechages_jours.toFixed(1)} j</dd>
            </div>
            <div>
              <dt>= Délai avant marge</dt>
              <dd>{estimation.decomposition.duree_avec_sechages_jours.toFixed(1)} j</dd>
            </div>
            <div>
              <dt>× Marge centrale (imprévus normaux)</dt>
              <dd>× {estimation.decomposition.coef_marge_centrale}</dd>
            </div>
            <div className="est-detail-total">
              <dt>Total</dt>
              <dd>
                {Math.round(estimation.delai_central_jours)} jours ≈ {estimation.delai_central_mois} mois
              </dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
