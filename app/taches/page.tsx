'use client';

import { useKlaro } from '@/app/providers';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ScenarioPanel from '@/components/ScenarioPanel';
import Toast from '@/components/ui/Toast';

export default function TachesPage() {
  const { state, result, toast, scenarioKey, changeScenario, resetScenario } = useKlaro();
  const { alerts } = result;

  return (
    <div className="app-shell">
      <Sidebar alertCount={alerts.length} />
      <div className="kb-content">
        <Topbar
          title="Tâches"
          project={`${state.project.nom} · ${state.project.lieu}`}
        />
        <div className="kb-main">
          <div style={{ color: 'var(--fg-muted)', fontSize: 14, paddingTop: 40, textAlign: 'center' }}>
            Vue liste complète — à venir
          </div>
        </div>
      </div>
      <ScenarioPanel current={scenarioKey} onChange={changeScenario} onReset={resetScenario} />
      {toast && <Toast message={toast} />}
    </div>
  );
}
