import Link from 'next/link';
import MarketingShell from '@/components/marketing/MarketingShell';

const PROBLEMS = [
  {
    icon: '?',
    title: 'Par où commencer ?',
    text: 'Sans ordre logique, on multiplie les allers-retours, on bloque un artisan parce qu\'on a oublié une étape, on refait deux fois.',
  },
  {
    icon: '!',
    title: 'Le bon ordre des travaux',
    text: 'Peindre avant le sol ? Carreler avant la plomberie ? Une erreur d\'ordre = un mois de retard et plusieurs milliers d\'euros.',
  },
  {
    icon: '⚠',
    title: 'La peur d\'oublier une étape',
    text: 'Une réservation oubliée pour la VMC, le faux-plafond fermé sans gaine électrique : le planning s\'effondre.',
  },
  {
    icon: '✓',
    title: 'Comment contrôler le travail ?',
    text: 'Sans expertise, comment savoir si la pose est conforme ? Sans contrôle, les malfaçons se révèlent trop tard.',
  },
];

const SOLUTIONS = [
  { title: 'Checklists guidées', text: 'Chaque corps de métier décomposé en étapes simples, ordonnées, dans le bon sens.' },
  { title: 'Étapes expliquées', text: 'Pour chaque tâche : explication claire, sans jargon, et la recommandation Klaro.' },
  { title: 'Erreurs à éviter', text: 'L\'erreur fréquente est signalée à chaque étape — apprenez de celles des autres.' },
  { title: 'Score chantier', text: 'Un score qui mesure où vous en êtes et ce qu\'il reste à faire pour finir proprement.' },
  { title: 'Alertes intelligentes', text: 'Klaro priorise les blocages : ce qui arrête le chantier passe en haut.' },
];

const TRADES = [
  'Électricité',
  'Plomberie',
  'Placo / Cloisons',
  'Isolation',
  'Toiture',
  'Sols',
  'Peinture',
  'Menuiseries',
  'Ventilation',
  'Extérieurs / VRD',
  'Contrôle final',
];

const TESTIMONIALS = [
  {
    quote: '"Je rénove ma maison seul. Klaro m\'a évité de fermer mon placo trop tôt — il manquait deux gaines élec. Économie : 600 €."',
    name: 'Florent R.',
    loc: 'Maison de campagne, Indre-et-Loire',
    avatar: 'FR',
  },
  {
    quote: '"J\'ai trois artisans sur le chantier. Le score chantier me dit en un coup d\'œil qui est en retard et ce qui bloque la suite."',
    name: 'Sarah M.',
    loc: 'Appartement haussmannien, Paris 11ᵉ',
    avatar: 'SM',
  },
  {
    quote: '"Bricoleur du dimanche, je m\'attaquais à une rénovation complète. Avec Klaro, je sais à chaque instant ce que je dois faire — et ce que je ne dois PAS faire."',
    name: 'Karim B.',
    loc: 'Maison neuve à finir, Rennes',
    avatar: 'KB',
  },
];

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function HeroPreview() {
  const r = 32;
  const c = 2 * Math.PI * r;
  const v = 73;
  return (
    <div className="mk-preview">
      <div className="mk-preview-head">
        <div className="mk-preview-ring">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r={r} stroke="var(--bg-2)" strokeWidth="6" fill="none" />
            <circle
              cx="35"
              cy="35"
              r={r}
              stroke="var(--accent)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (c * v) / 100}
            />
          </svg>
          <div className="num">{v}</div>
        </div>
        <div className="mk-preview-info">
          <div className="label">Score chantier</div>
          <div className="title">Maison Florent</div>
          <div className="sub">12 tâches finies · 3 en cours · 1 alerte</div>
        </div>
      </div>

      <div className="mk-preview-list">
        <div className="mk-preview-item done">
          <div className="mk-preview-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="name">Tableau électrique posé</span>
          <span className="mk-preview-tag elec">Élec</span>
        </div>

        <div className="mk-preview-item done">
          <div className="mk-preview-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="name">Test mise en pression PCBT validé</span>
          <span className="mk-preview-tag plomb">Plomb</span>
        </div>

        <div className="mk-preview-item warn">
          <div className="mk-preview-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span className="name">Photographier réseaux avant fermeture</span>
          <span className="mk-preview-tag warn">Bloquant</span>
        </div>

        <div className="mk-preview-item">
          <div className="mk-preview-check" />
          <span className="name">Pose pare-vapeur côté chaud</span>
          <span className="mk-preview-tag placo">Placo</span>
        </div>

        <div className="mk-preview-item">
          <div className="mk-preview-check" />
          <span className="name">Coulage de la chape sur PCBT</span>
          <span className="mk-preview-tag plomb">Plomb</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="mk-hero" id="fonctionnement">
        <div className="mk-hero-grid">
          <div>
            <span className="mk-eyebrow">Suivi de chantier pour particuliers</span>
            <h1 className="mk-h1">
              Voir clair sur <em>son chantier.</em><br />
              C&apos;est Klaro.
            </h1>
            <p className="mk-lead">
              Klaro vous dit quoi faire, quand le faire, et vous évite les erreurs.
              Que vous fassiez les travaux vous-même ou que vous pilotiez des artisans,
              vous gardez le contrôle.
            </p>
            <div className="mk-hero-cta">
              <Link href="/questionnaire" className="mk-btn mk-btn-dark mk-btn-lg">
                Commencer mon chantier
              </Link>
              <Link href="/offres" className="mk-btn mk-btn-outline mk-btn-lg">
                Voir les offres
              </Link>
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* Stats bar */}
      <section className="mk-stats-bar">
        <div className="mk-stats-grid">
          <div className="mk-stat-item">
            <div className="mk-stat-v">11</div>
            <div className="mk-stat-l">Métiers couverts</div>
          </div>
          <div className="mk-stat-item">
            <div className="mk-stat-v">200+</div>
            <div className="mk-stat-l">Étapes guidées</div>
          </div>
          <div className="mk-stat-item">
            <div className="mk-stat-v">0 €</div>
            <div className="mk-stat-l">Pour démarrer</div>
          </div>
          <div className="mk-stat-item">
            <div className="mk-stat-v">1</div>
            <div className="mk-stat-l">Tableau de bord</div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="mk-section">
        <div className="mk-container">
          <div className="mk-section-head">
            <h2 className="mk-h2">Pourquoi les travaux deviennent vite compliqués ?</h2>
            <p className="mk-section-sub">
              Rénover sans être du métier, c&apos;est jongler avec trois inconnus en même temps :
              l&apos;ordre, les délais, les contrôles.
            </p>
          </div>

          <div className="mk-cards-grid cols-4">
            {PROBLEMS.map((p) => (
              <div className="mk-card" key={p.title}>
                <div className="mk-card-icon warn">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{p.icon}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="mk-section mk-section-sand">
        <div className="mk-container">
          <div className="mk-section-head">
            <h2 className="mk-h2">Klaro vous guide à chaque étape</h2>
            <p className="mk-section-sub">
              Un seul tableau de bord. Le bon ordre. Les bonnes étapes. Les bonnes alertes.
            </p>
          </div>

          <div className="mk-cards-grid cols-5">
            {SOLUTIONS.map((s) => (
              <div className="mk-card" key={s.title}>
                <div className="mk-card-icon dark">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trades */}
      <section className="mk-section">
        <div className="mk-container">
          <div className="mk-section-head">
            <h2 className="mk-h2">Tous les corps de métier, dans un seul outil</h2>
            <p className="mk-section-sub">
              De la démolition au contrôle final, Klaro couvre l&apos;intégralité du cycle d&apos;un chantier de rénovation.
            </p>
          </div>

          <div className="mk-pills">
            {TRADES.map((t) => (
              <span key={t} className="mk-pill">
                <span className="pill-dot" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mk-section mk-section-sand">
        <div className="mk-container">
          <div className="mk-section-head">
            <h2 className="mk-h2">Ils ont vu clair sur leur chantier</h2>
          </div>

          <div className="mk-cards-grid cols-3">
            {TESTIMONIALS.map((t) => (
              <div className="mk-testimonial" key={t.name}>
                <div className="mk-testimonial-stars">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
                </div>
                <p className="mk-testimonial-quote">{t.quote}</p>
                <div className="mk-testimonial-author">
                  <div className="mk-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="mk-testimonial-name">{t.name}</div>
                    <div className="mk-testimonial-loc">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mk-cta-final">
        <div className="mk-container-narrow">
          <h2 className="mk-h2">Organisez votre chantier dès aujourd&apos;hui</h2>
          <p className="mk-lead" style={{ margin: '0 auto 28px', textAlign: 'center' }}>
            Gratuit pour commencer. Sans carte bancaire. Sans engagement.
          </p>
          <Link href="/questionnaire" className="mk-btn mk-btn-accent mk-btn-lg">
            Commencer mon chantier
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
