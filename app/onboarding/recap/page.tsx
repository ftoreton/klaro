import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import { calculerEstimation } from '@/lib/estimation/calculate';
import { getEstimationTaches } from '@/lib/estimation/queries';
import { getCurrentNiveauOrFallback } from '@/lib/niveau/queries';
import { getCurrentProject, getCurrentUser } from '@/lib/supabase/queries';
import { RYTHME_FALLBACK } from '@/lib/estimation/constants';
import './recap.css';

export const dynamic = 'force-dynamic';

export default async function OnboardingRecapPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/onboarding/recap');

  const project = await getCurrentProject();
  if (!project) redirect('/onboarding');

  const [niveau, taches] = await Promise.all([
    getCurrentNiveauOrFallback(),
    getEstimationTaches(project.id),
  ]);

  const estimation = calculerEstimation({
    taches,
    niveau,
    rythme: project.rythme ?? RYTHME_FALLBACK,
  });

  const joursTravailRounded = Math.round(estimation.jours_travail_effectif);

  return (
    <div className="recap-root">
      <header className="recap-head">
        <div className="recap-logo" aria-label="Klaro">
          <span className="recap-logo-mark">K</span>
          <span className="recap-logo-name">Klaro</span>
        </div>
      </header>

      <main className="recap-main">
        <p className="recap-eyebrow">Ton chantier · {project.name}</p>
        <h1 className="recap-title">Estimation pour ton chantier</h1>

        {estimation.confiance === 'indisponible' ? (
          <section className="recap-unavailable">
            <Info size={20} />
            <div>
              <p className="recap-unavailable-title">Estimation indisponible pour le moment</p>
              <p className="recap-unavailable-text">
                Klaro affine encore les durées pour les métiers que tu as choisis.
                Tu pourras suivre l&apos;avancement de ton chantier depuis le tableau de bord —
                l&apos;estimation s&apos;activera dès que les durées seront calibrées.
              </p>
            </div>
          </section>
        ) : (
          <section className="recap-estimate">
            <div className="recap-number">~{estimation.delai_central_mois}<span className="recap-unit">mois</span></div>
            <p className="recap-range">
              entre {estimation.borne_basse_mois} et {estimation.borne_haute_mois} mois selon les imprévus
            </p>
            <p className="recap-work">
              Soit <strong>{joursTravailRounded} jours</strong> de travail effectif à ton rythme.
            </p>

            {estimation.confiance === 'partielle' && (
              <p className="recap-disclaimer">
                <Info size={14} />
                Estimation partielle : tous les métiers ne sont pas encore calibrés. Le chiffre s&apos;affinera au fil des mises à jour.
              </p>
            )}
          </section>
        )}

        <div className="recap-actions">
          <Link href="/estimation" className="recap-btn recap-btn-ghost">
            Voir le détail
          </Link>
          <Link href="/dashboard" className="recap-btn recap-btn-primary">
            Commencer mon chantier
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
