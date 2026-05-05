'use client';

import { useKlaro } from '@/app/providers';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import ScenarioPanel from '@/components/ScenarioPanel';
import Toast from '@/components/ui/Toast';
import Icon from '@/components/ui/Icon';
import type { Devis } from '@/lib/types';

function DevisRow({ devis, onSign }: { devis: Devis; onSign: (id: string) => void }) {
  return (
    <div className="devis-row">
      <div className="devis-icon">
        <Icon name="doc" size={18} />
      </div>

      <div className="devis-info">
        <div className="devis-file">{devis.fichier}</div>
        <div className="devis-meta">
          <span className="devis-metier">{devis.metier}</span>
          <span className="sep" />
          <span>{devis.artisan}</span>
          <span className="sep" />
          <span className="devis-amount">{devis.montant}</span>
        </div>
      </div>

      <div className="devis-status">
        {devis.signe ? (
          <span className="tag success">
            <Icon name="check" size={11} strokeWidth={2.5} />
            Signé
          </span>
        ) : (
          <span className="tag warn">
            En attente · {devis.recuDepuis}j
          </span>
        )}
      </div>

      <div className="devis-actions">
        {!devis.signe ? (
          <>
            <button className="btn-do" onClick={() => onSign(devis.id)}>
              <Icon name="check" size={12} /> Signer
            </button>
            <button className="btn-later">
              <Icon name="phone" size={12} /> Contacter
            </button>
          </>
        ) : (
          <button className="btn-later">Voir →</button>
        )}
      </div>
    </div>
  );
}

export default function DevisPage() {
  const {
    state,
    result,
    toast,
    scenarioKey,
    signDevis,
    changeScenario,
    resetScenario,
  } = useKlaro();

  const { alerts } = result;
  const devis = state.devis;
  const enAttente = devis.filter((d) => !d.signe);
  const signes = devis.filter((d) => d.signe);
  const totalEnAttente = enAttente.reduce((sum, d) => {
    const n = parseFloat(d.montant.replace(/[^\d,.-]/g, '').replace(',', '.'));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="app-shell">
      <Sidebar alertCount={alerts.length} />

      <div className="kb-content">
        <Topbar
          title="Devis"
          project={`${state.project.nom} · ${state.project.lieu}`}
        />

        <div className="kb-main">
          <div className="devis-summary">
            <div className="devis-summary-stat">
              <div className="v">{devis.length}</div>
              <div className="l">total</div>
            </div>
            <div className="devis-summary-stat warn">
              <div className="v">{enAttente.length}</div>
              <div className="l">en attente</div>
            </div>
            <div className="devis-summary-stat success">
              <div className="v">{signes.length}</div>
              <div className="l">signés</div>
            </div>
            {totalEnAttente > 0 && (
              <div className="devis-summary-amount">
                <div className="eyebrow">Montant en attente</div>
                <div className="amount">
                  {totalEnAttente.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
            )}
          </div>

          {enAttente.length > 0 && (
            <section className="devis-section">
              <header className="devis-section-head">
                <h3>En attente de signature</h3>
                <span className="sub">· Klaro vous recommande de traiter ceux-ci</span>
              </header>
              <div className="devis-list">
                {enAttente.map((d) => (
                  <DevisRow key={d.id} devis={d} onSign={signDevis} />
                ))}
              </div>
            </section>
          )}

          {signes.length > 0 && (
            <section className="devis-section">
              <header className="devis-section-head">
                <h3>Signés</h3>
                <span className="sub">· archivés</span>
              </header>
              <div className="devis-list">
                {signes.map((d) => (
                  <DevisRow key={d.id} devis={d} onSign={signDevis} />
                ))}
              </div>
            </section>
          )}

          {devis.length === 0 && (
            <div className="empty-state" style={{ minHeight: 300 }}>
              <div className="icon-wrap">
                <Icon name="doc" size={28} strokeWidth={2} />
              </div>
              <h3>Aucun devis pour l&apos;instant</h3>
              <p>Klaro affichera ici tous les devis reçus, signés ou non.</p>
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
