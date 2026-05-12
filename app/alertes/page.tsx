'use client';

import { useKlaro } from '@/app/providers';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import AlertFocus from '@/components/alerts/AlertFocus';
import AlertMini from '@/components/alerts/AlertMini';
import Toast from '@/components/ui/Toast';
import ScenarioPanel from '@/components/ScenarioPanel';
import Icon from '@/components/ui/Icon';

export default function AlertesPage() {
  const {
    state,
    result,
    toast,
    scenarioKey,
    onValidateAlert,
    onLaterAlert,
    changeScenario,
    resetScenario,
  } = useKlaro();

  const { alerts } = result;
  const focus = alerts[0];
  const rest = alerts.slice(1);

  return (
    <div className="app-shell">
      <Sidebar alertCount={alerts.length} />

      <div className="kb-content">
        <Topbar
          title="Centre d'alertes"
          project={`${state.project.nom} · ${state.project.lieu}`}
        />

        <div className="kb-main">
          {!focus ? (
            <div className="empty-state" style={{ flex: 1, minHeight: 400 }}>
              <div className="icon-wrap">
                <Icon name="check" size={28} strokeWidth={2} />
              </div>
              <h3>Klaro voit clair</h3>
              <p>Aucun point à traiter. Tout est sous contrôle.</p>
            </div>
          ) : (
            <div className="alerts-grid">
              <AlertFocus
                alert={focus}
                totalCount={alerts.length}
                onValidate={onValidateAlert}
                onLater={onLaterAlert}
              />

              <div className="alerts-rest">
                <div className="label">Aussi à voir · {rest.length}</div>

                {rest.length === 0 && (
                  <div
                    style={{
                      padding: 14,
                      color: 'var(--fg-muted)',
                      fontSize: 12,
                      textAlign: 'center',
                      border: '1px dashed var(--border)',
                      borderRadius: 'var(--r-md)',
                    }}
                  >
                    Rien d&apos;autre — tu peux respirer.
                  </div>
                )}

                {rest.map((alert) => (
                  <AlertMini key={alert.id} alert={alert} />
                ))}

                {rest.length > 0 && (
                  <div className="alerts-hint">
                    Klaro priorise pour toi — résous celle-ci d&apos;abord.
                  </div>
                )}
              </div>
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
