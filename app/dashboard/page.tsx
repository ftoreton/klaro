import { redirect } from 'next/navigation';
import {
  getCurrentProject,
  getCurrentUser,
  getProjectTasks,
} from '@/lib/supabase/queries';
import { TRADE_LABEL_BY_KEY } from '@/data/onboarding/trades';
import { loadTrade } from '@/lib/onboarding/loader';
import type { TradeKey } from '@/data/onboarding/trades';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import DashboardClient from './DashboardClient';
import './dashboard.css';

export const dynamic = 'force-dynamic';

const PROJECT_TYPE_LABEL: Record<string, string> = {
  renovation_totale: 'Rénovation totale',
  renovation_partielle: 'Rénovation partielle',
  extension: 'Extension',
  construction_neuve: 'Construction neuve',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/dashboard');

  const project = await getCurrentProject();
  if (!project) redirect('/onboarding');

  const tasks = await getProjectTasks(project.id);

  // Score: done/total - blocking*8, plancher 20.
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const blockingPending = tasks.filter((t) => t.is_blocking && t.status !== 'done').length;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;
  const score = total === 0 ? 100 : Math.max(20, Math.min(100, completion - blockingPending * 8));
  const tone: 'success' | 'warn' | 'danger' = score >= 75 ? 'success' : score >= 50 ? 'warn' : 'danger';

  // Métadonnées des trades + libellés des phases présentes — chargés depuis
  // le loader (source de vérité). Permet de regrouper joliment côté client.
  const tradesInTasks = Array.from(new Set(tasks.map((t) => t.trade_key))) as TradeKey[];
  const tradeMeta = tradesInTasks.map((key) => {
    const meta = TRADE_LABEL_BY_KEY[key];
    const loaded = loadTrade(key);
    const phaseLabels: Record<string, string> = {};
    for (const p of loaded.phases) phaseLabels[p.id] = p.label;
    return {
      key,
      label: meta?.label ?? key,
      icon: meta?.icon ?? '🛠️',
      phaseLabels,
    };
  });

  const projectSummary = `${project.name} · ${PROJECT_TYPE_LABEL[project.type] ?? project.type}`;

  return (
    <div className="app-shell">
      <Sidebar alertCount={blockingPending} />

      <div className="kb-content">
        <Topbar title="Tableau de bord" project={projectSummary} />

        <div className="kb-main">
          <DashboardClient
            project={{ id: project.id, name: project.name, type: project.type }}
            tasks={tasks}
            tradeMeta={tradeMeta}
            score={score}
            tone={tone}
            stats={{ done, total, blocking: blockingPending }}
          />
        </div>
      </div>

      <div className="mobile-nav">
        <MobileNav alertCount={blockingPending} />
      </div>
    </div>
  );
}
