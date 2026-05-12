import { redirect } from 'next/navigation';
import { Info } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import { getCurrentUser, getCurrentProject } from '@/lib/supabase/queries';
import { getCurrentNiveau } from '@/lib/niveau/queries';
import NiveauForm from './NiveauForm';
import './parametres.css';

export const dynamic = 'force-dynamic';

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/parametres');

  const [niveau, project, { onboarding }] = await Promise.all([
    getCurrentNiveau(),
    getCurrentProject(),
    searchParams,
  ]);
  const isOnboarding = onboarding === 'true';
  const projectSummary = project ? project.name : 'Klaro';

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="kb-content">
        <Topbar title="Paramètres" project={projectSummary} />

        <div className="kb-main">
          <div className="pa">
            <header className="pa-head">
              <h1 className="pa-h1">Paramètres</h1>
              <p className="pa-sub">Personnalise ton expérience Klaro.</p>
            </header>

            {isOnboarding && (
              <div className="pa-welcome" role="status">
                <strong>Bienvenue 👋</strong>
                <span>Choisis ton niveau pour personnaliser ton expérience.</span>
              </div>
            )}

            <section className="pa-section">
              <header className="pa-section-head">
                <h2 className="pa-h2">Ton niveau en bricolage</h2>
                <p className="pa-section-sub">
                  Sélectionne le profil qui te correspond le mieux.
                </p>
              </header>

              <div className="pa-info" role="note">
                <Info size={16} />
                <span>
                  Ton niveau influence les estimations de durée des tâches que tu réalises toi-même.
                  Les tâches déjà commencées ne sont pas recalculées.
                </span>
              </div>

              <NiveauForm currentNiveau={niveau} isOnboarding={isOnboarding} />
            </section>
          </div>
        </div>
      </div>

      <div className="mobile-nav">
        <MobileNav />
      </div>
    </div>
  );
}
