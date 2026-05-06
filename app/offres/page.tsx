import Link from 'next/link';
import MarketingShell from '@/components/marketing/MarketingShell';

const FREE_FEATURES = [
  '1 chantier test',
  'Aperçu des modules métiers',
  'Quelques checklists d\'exemple',
  'Score basique',
  'Tableau de bord simplifié',
];

const PRO_FEATURES = [
  'Tous les modules métiers (11 corps de métier)',
  'Checklists détaillées par étape',
  'Recommandations Klaro à chaque tâche',
  'Erreurs fréquentes à éviter',
  'Score chantier complet',
  'Photos par tâche',
  'Planification & dépendances',
  'Suivi de progression en temps réel',
  'Moteur de blocage intelligent (à venir)',
];

interface CompareRow {
  feature: string;
  free: 'check' | 'dash' | string;
  pro: 'check' | 'dash' | string;
}

const COMPARE: CompareRow[] = [
  { feature: 'Création chantier', free: 'check', pro: 'check' },
  { feature: 'Modules métiers', free: 'Limité', pro: 'Tous (11)' },
  { feature: 'Checklists détaillées', free: 'Basique', pro: 'check' },
  { feature: 'Photos par tâche', free: 'dash', pro: 'check' },
  { feature: 'Planification', free: 'dash', pro: 'check' },
  { feature: 'Score chantier', free: 'Basique', pro: 'Complet' },
  { feature: 'Alertes intelligentes', free: 'dash', pro: 'check' },
  { feature: 'Accès complet aux métiers', free: 'dash', pro: 'check' },
  { feature: 'Recommandations & erreurs à éviter', free: 'dash', pro: 'check' },
  { feature: 'Prix', free: '0 €', pro: '39 € / chantier' },
];

function Cell({ value }: { value: 'check' | 'dash' | string }) {
  if (value === 'check') {
    return (
      <span className="check" aria-label="Inclus">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (value === 'dash') return <span className="dash" aria-label="Non inclus">—</span>;
  return <span className="text">{value}</span>;
}

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mk-section">
        <div className="mk-container">
          <div className="mk-section-head">
            <span className="mk-eyebrow">Tarifs</span>
            <h1 className="mk-h2" style={{ marginTop: 18 }}>Une offre pour chaque chantier</h1>
            <p className="mk-section-sub">
              Pas d&apos;abonnement, pas d&apos;engagement. Un paiement unique par chantier — point.
            </p>
          </div>

          <div className="mk-pricing-grid">
            <div className="mk-pricing-card">
              <div className="mk-pricing-name">Gratuit limité</div>
              <p className="mk-pricing-tagline">Pour découvrir Klaro et voir si l&apos;outil correspond à votre projet.</p>

              <div className="mk-pricing-price">
                <span className="v">0&nbsp;€</span>
                <span className="p">/ pour toujours</span>
              </div>

              <ul className="mk-pricing-list">
                {FREE_FEATURES.map((f) => <li key={f}>{f}</li>)}
              </ul>

              <div className="mk-pricing-cta">
                <Link href="/inscription" className="mk-btn mk-btn-outline">
                  Créer un compte gratuit
                </Link>
              </div>
            </div>

            <div className="mk-pricing-card featured">
              <span className="mk-pricing-badge">Recommandé</span>
              <div className="mk-pricing-name">Pro chantier</div>
              <p className="mk-pricing-tagline">L&apos;offre complète pour piloter sereinement un chantier de A à Z.</p>

              <div className="mk-pricing-price">
                <span className="v">39&nbsp;€</span>
                <span className="p">/ chantier · paiement unique</span>
              </div>

              <ul className="mk-pricing-list">
                {PRO_FEATURES.map((f) => <li key={f}>{f}</li>)}
              </ul>

              <div className="mk-pricing-cta">
                <Link href="/questionnaire" className="mk-btn mk-btn-accent">
                  Commencer mon chantier
                </Link>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="mk-section-head" style={{ marginTop: 64, marginBottom: 24 }}>
            <h2 className="mk-h3" style={{ fontSize: 22 }}>Comparatif détaillé</h2>
          </div>

          <div className="mk-compare">
            <table className="mk-compare-table">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Fonctionnalité</th>
                  <th style={{ width: '25%' }}>Gratuit</th>
                  <th className="featured" style={{ width: '25%' }}>Pro 39 €</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.feature}>
                    <td className="feature">{row.feature}</td>
                    <td><Cell value={row.free} /></td>
                    <td><Cell value={row.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQ link */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 12 }}>
              Une question sur les offres ?
            </p>
            <Link href="/faq" className="mk-btn mk-btn-outline">
              Consulter la FAQ
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
