import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import {
  getCurrentProject,
  getCurrentUser,
  getProjectTasks,
  getProjectTrades,
} from '@/lib/supabase/queries';
import { getCurrentNiveauOrFallback } from '@/lib/niveau/queries';
import { loadAllTrades } from '@/lib/onboarding/loader';
import { calculerEstimation } from '@/lib/estimation/calculate';
import { projectTasksToEstimationTaches } from '@/lib/estimation/queries';
import { RYTHME_FALLBACK } from '@/lib/estimation/constants';
import { getPalierForCount, getUpgradePrice } from '@/lib/pricing/types';
import { TRADES_META, type TradeKey } from '@/data/onboarding/trades';
import ChantierEditor from './ChantierEditor';
import './chantier-modifier.css';

export const dynamic = 'force-dynamic';

export default async function ChantierModifierPage({
  searchParams,
}: {
  searchParams: Promise<{ metier?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/chantier/modifier');

  const project = await getCurrentProject();
  if (!project) redirect('/onboarding');

  const [niveau, tradeRows, taskRows, { metier: scrollToMetier }] = await Promise.all([
    getCurrentNiveauOrFallback(),
    getProjectTrades(project.id),
    getProjectTasks(project.id),
    searchParams,
  ]);

  // Index minimal des tâches (decision 5/option c) : on précompute côté serveur
  // l'arborescence métier → phases → tâches avec uniquement les champs nécessaires
  // au client (id, label, isBlocking, durée, séchage, pro_recommended).
  // ~700 tâches × ~7 champs = quelques KB, acceptable pour la sticky bar live.
  const allTrades = loadAllTrades();

  // Estimation initiale (snapshot pris au chargement, cf. décision 2/option a).
  // Le client comparera ses futurs recalculs à cette valeur pour afficher le
  // diff "+2 semaines" / "-1 semaine".
  const estimationInitiale = calculerEstimation({
    taches: projectTasksToEstimationTaches(taskRows),
    niveau,
    rythme: project.rythme ?? RYTHME_FALLBACK,
  });

  // Palier actuel + différentiel upgrade — pour précalculer l'état des cartes
  // métier non sélectionnées (disponible_sans_upgrade vs disponible_avec_upgrade).
  const currentTradesSet = new Set(tradeRows.map((t) => t.trade_key as TradeKey));
  const currentTradeCount = currentTradesSet.size;
  const currentPalier = getPalierForCount(currentTradeCount);
  const nextPalier = getPalierForCount(currentTradeCount + 1);
  const upgradeDiffCents =
    nextPalier !== currentPalier ? getUpgradePrice(currentPalier, nextPalier) : 0;

  const projectSummary = project.name;

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="kb-content">
        <Topbar title="Modifier mon chantier" project={projectSummary} />

        <div className="kb-main">
          <ChantierEditor
            project={{
              id: project.id,
              name: project.name,
              rythme: project.rythme ?? RYTHME_FALLBACK,
            }}
            niveau={niveau}
            allTrades={allTrades}
            initialTradeKeys={Array.from(currentTradesSet)}
            initialTaskRows={taskRows}
            estimationInitiale={estimationInitiale}
            currentPalier={currentPalier}
            nextPalier={nextPalier}
            upgradeDiffCents={upgradeDiffCents}
            tradesMeta={TRADES_META}
            scrollToMetier={scrollToMetier ?? null}
          />
        </div>
      </div>

      <div className="mobile-nav">
        <MobileNav />
      </div>
    </div>
  );
}
