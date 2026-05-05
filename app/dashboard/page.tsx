'use client';

import { useKlaro } from '@/app/providers';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import ScoreCard from '@/components/dashboard/ScoreCard';
import NextAction from '@/components/dashboard/NextAction';
import TasksList from '@/components/dashboard/TasksList';
import AlertStrip from '@/components/dashboard/AlertStrip';
import Toast from '@/components/ui/Toast';
import ScenarioPanel from '@/components/ScenarioPanel';

export default function DashboardPage() {
  const {
    state,
    result,
    toast,
    scenarioKey,
    onValidate,
    onLater,
    changeScenario,
    resetScenario,
  } = useKlaro();

  const { score, todays, alerts, stats } = result;
  const topAlert = alerts[0];
  const nextTask = todays[0];
  const restTasks = todays.slice(1);
  const pendingCount = state.tasks.filter((t) => t.statut !== 'terminé').length;

  return (
    <div className="app-shell">
      <Sidebar alertCount={alerts.length} />

      <div className="kb-content">
        <Topbar
          title="Tableau de bord"
          project={`${state.project.nom} · ${state.project.lieu} · ${state.project.jour}`}
        />

        <div className="kb-main">
          <ScoreCard score={score} stats={stats} alertCount={alerts.length} />

          {topAlert && <AlertStrip alert={topAlert} />}

          {nextTask && (
            <NextAction
              task={nextTask}
              allTasks={state.tasks}
              onValidate={onValidate}
              onLater={onLater}
            />
          )}

          {restTasks.length > 0 && (
            <TasksList
              tasks={restTasks}
              allTasks={state.tasks}
              pendingCount={pendingCount}
              onValidate={onValidate}
              onLater={onLater}
            />
          )}

          {!nextTask && (
            <div className="empty-state" style={{ minHeight: 300 }}>
              <div className="icon-wrap">
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3>Klaro voit clair</h3>
              <p>Toutes les tâches prioritaires sont traitées.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mobile-nav">
        <MobileNav alertCount={alerts.length} />
      </div>

      <ScenarioPanel
        current={scenarioKey}
        onChange={changeScenario}
        onReset={resetScenario}
      />

      {toast && <Toast message={toast} />}
    </div>
  );
}
