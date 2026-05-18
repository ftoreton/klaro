import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import { getEstimationTaches } from '@/lib/estimation/queries';
import { getCurrentNiveauOrFallback } from '@/lib/niveau/queries';
import { getCurrentProject, getCurrentUser } from '@/lib/supabase/queries';
import EstimationSimulator from './EstimationSimulator';
import './estimation.css';

export const dynamic = 'force-dynamic';

export default async function EstimationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/estimation');

  const project = await getCurrentProject();
  if (!project) redirect('/onboarding');

  const [niveau, taches] = await Promise.all([
    getCurrentNiveauOrFallback(),
    getEstimationTaches(project.id),
  ]);

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="kb-content">
        <Topbar title="Estimation" project={project.name} />

        <div className="kb-main">
          <EstimationSimulator
            projectId={project.id}
            initialRythme={project.rythme}
            currentNiveau={niveau}
            taches={taches}
          />
        </div>
      </div>

      <div className="mobile-nav">
        <MobileNav />
      </div>
    </div>
  );
}
