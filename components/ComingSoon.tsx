'use client';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import ScenarioPanel from '@/components/ScenarioPanel';
import Toast from '@/components/ui/Toast';
import Icon from '@/components/ui/Icon';
import { useKlaro } from '@/app/providers';

interface ComingSoonProps {
  title: string;
  iconName: 'cal' | 'euro' | 'doc' | 'msg';
  description: string;
}

export default function ComingSoon({ title, iconName, description }: ComingSoonProps) {
  const {
    state,
    result,
    toast,
    scenarioKey,
    changeScenario,
    resetScenario,
  } = useKlaro();

  const { alerts } = result;

  return (
    <div className="app-shell">
      <Sidebar alertCount={alerts.length} />

      <div className="kb-content">
        <Topbar
          title={title}
          project={`${state.project.nom} · ${state.project.lieu}`}
        />

        <div className="kb-main">
          <div className="empty-state" style={{ minHeight: 400 }}>
            <div className="icon-wrap">
              <Icon name={iconName} size={28} strokeWidth={2} />
            </div>
            <h3>{title} — bientôt</h3>
            <p>{description}</p>
          </div>
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
