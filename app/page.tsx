'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import './page.css';

// ── Mini icons ──
type IconName = 'check' | 'bell' | 'warn' | 'home' | 'list' | 'doc' | 'arrow' | 'signal' | 'wifi' | 'battery';
const I: Record<IconName, React.ReactNode> = {
  check: <path d="M20 6L9 17l-5-5" />,
  bell: <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 004 0" />,
  warn: <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />,
  home: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  doc: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  signal: <path d="M2 18h2M6 14h2M10 10h2M14 6h2M18 2h2" />,
  wifi: <path d="M5 12.55a11 11 0 0114 0M2 8.82a16 16 0 0120 0M8.5 16.43a6 6 0 017 0M12 20h.01" />,
  battery: <path d="M2 7h16v10H2zM18 10v4h2v-4z" />,
};

function Ic({ name, size = 14, sw = 1.8, color }: { name: IconName; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {I[name]}
    </svg>
  );
}

// ── Brand mark : K logo (Netflix-style) ──
function KMark({ size = 30, radius = 8 }: { size?: number; radius?: number }) {
  return (
    <span className="kl-mark" style={{ width: size, height: size, borderRadius: radius }}>
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none" stroke="#00b89c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M7 4v16M7 12l9-8M7 12l9 8" />
      </svg>
    </span>
  );
}

// ── Score ring (animated number) ──
function Ring({ value, size = 78, sw = 7 }: { value: number; size?: number; sw?: number }) {
  const [v, setV] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    let raf: number | undefined;
    let t0: number | undefined;
    const dur = 900;
    const start = prevRef.current;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(start + (value - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, [value]);
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  const tone = v >= 75 ? '#00b89c' : v >= 50 ? '#d97706' : '#d73a3a';
  return (
    <div className="kl-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#ecebe5" strokeWidth={sw} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={sw}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{ transition: 'stroke 400ms' }}
        />
      </svg>
      <div className="kl-ring-num">
        <span className="kl-v" style={{ color: tone }}>{v}</span>
        <span className="kl-l">/ 100</span>
      </div>
    </div>
  );
}

type TaskTagClass = 'kl-tag-elec' | 'kl-tag-plomb' | 'kl-tag-placo' | 'kl-tag-blocking';
type Task = {
  id: string;
  name: string;
  tag: string;
  tagClass: TaskTagClass;
  done: boolean;
  blocking?: boolean;
  why?: string;
  justDone?: boolean;
};

const TASKS_HOME: Task[] = [
  { id: 't1', name: 'Tableau électrique posé', tag: 'élec', tagClass: 'kl-tag-elec', done: true },
  { id: 't2', name: 'Test mise en pression PCBT validé', tag: 'plomb', tagClass: 'kl-tag-plomb', done: true },
  { id: 't3', name: 'Photographier réseaux avant fermeture', tag: 'bloquant', tagClass: 'kl-tag-blocking', done: false, blocking: true, why: 'Bloque la pose du placo' },
  { id: 't4', name: 'Pose pare-vapeur côté chaud', tag: 'placo', tagClass: 'kl-tag-placo', done: false, why: "À faire aujourd'hui" },
  { id: 't5', name: 'Coulage de la chape sur PCBT', tag: 'plomb', tagClass: 'kl-tag-plomb', done: false, why: 'Dans 2 jours' },
];

type TabId = 'home' | 'tasks' | 'alerts' | 'docs';
const TABS: { id: TabId; name: string; icon: IconName }[] = [
  { id: 'home', name: 'Tableau de bord', icon: 'home' },
  { id: 'tasks', name: 'Mes tâches', icon: 'list' },
  { id: 'alerts', name: 'Mes alertes', icon: 'warn' },
  { id: 'docs', name: 'Documents', icon: 'doc' },
];

const ALERTS_VIEW = [
  { level: 'critical' as const, title: 'Photographier les réseaux', sub: 'Avant que le plaquiste ferme — irréversible', tag: 'BLOQUANT' },
  { level: 'warn' as const, title: 'Pare-vapeur à poser côté chaud', sub: 'Erreur fréquente : sens de pose', tag: 'ATTENTION' },
];

type Toast = { kind: 'ok' | 'alert'; t: string; s: string } | null;
type Cursor = { x: number; y: number; tap: boolean } | null;
type Push = { t: string; s: string } | null;

function PhoneDemo() {
  const [tasks, setTasks] = useState<Task[]>(TASKS_HOME);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [toast, setToast] = useState<Toast>(null);
  const [bellRing, setBellRing] = useState(false);
  const [scoreBoost, setScoreBoost] = useState(false);
  const [step, setStep] = useState(0);
  const [cursor, setCursor] = useState<Cursor>(null);
  const [push, setPush] = useState<Push>(null);
  const [statusTime, setStatusTime] = useState('9:41');
  const [navHighlight, setNavHighlight] = useState<TabId | null>(null);

  // Live score
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const blocking = tasks.filter((t) => t.blocking && !t.done).length;
  const score = Math.max(20, Math.min(100, Math.round((done / total) * 100) - blocking * 8 + 28));
  const alertCount = blocking;

  // Status bar tick
  useEffect(() => {
    const id = setInterval(() => {
      setStatusTime((prev) => {
        const [h, m] = prev.split(':').map(Number);
        const next = m + 1;
        return next >= 60 ? `${h + 1}:00` : `${h}:${String(next).padStart(2, '0')}`;
      });
    }, 12000);
    return () => clearInterval(id);
  }, []);

  // Choreography
  useEffect(() => {
    const timeline: { at: number; action: () => void }[] = [
      { at: 1200, action: () => setCursor({ x: 50, y: 70, tap: false }) },
      {
        at: 2200,
        action: () => {
          setCursor({ x: 50, y: 70, tap: true });
          setTimeout(() => {
            setTasks((prev) => prev.map((t) => (t.id === 't4' ? { ...t, done: true, justDone: true } : { ...t, justDone: false })));
            setScoreBoost(true);
            setTimeout(() => setScoreBoost(false), 900);
            setToast({ kind: 'ok', t: 'Tâche validée', s: 'Score chantier · +12 pts' });
          }, 200);
        },
      },
      { at: 2900, action: () => setCursor(null) },
      {
        at: 4200,
        action: () => {
          setPush({ t: 'Klaro', s: 'Blocage détecté · Photographier les réseaux avant fermeture' });
          setBellRing(true);
          setNavHighlight('alerts');
          setTimeout(() => setBellRing(false), 1400);
        },
      },
      { at: 5600, action: () => setToast(null) },
      { at: 6000, action: () => setCursor({ x: 50, y: 8, tap: false }) },
      {
        at: 6700,
        action: () => {
          setCursor({ x: 50, y: 8, tap: true });
          setTimeout(() => {
            setActiveTab('alerts');
            setPush(null);
            setNavHighlight(null);
          }, 200);
        },
      },
      { at: 7400, action: () => setCursor(null) },
      { at: 9800, action: () => setCursor({ x: 12, y: 92, tap: false }) },
      {
        at: 10500,
        action: () => {
          setCursor({ x: 12, y: 92, tap: true });
          setTimeout(() => setActiveTab('home'), 200);
        },
      },
      { at: 11200, action: () => setCursor(null) },
      { at: 12200, action: () => setCursor({ x: 50, y: 78, tap: false }) },
      {
        at: 13000,
        action: () => {
          setCursor({ x: 50, y: 78, tap: true });
          setTimeout(() => {
            setTasks((prev) => prev.map((t) => (t.id === 't5' ? { ...t, done: true, justDone: true } : { ...t, justDone: false })));
            setScoreBoost(true);
            setTimeout(() => setScoreBoost(false), 900);
            setToast({ kind: 'ok', t: 'Bon avancement !', s: 'Plus que 2 priorités' });
          }, 200);
        },
      },
      { at: 13800, action: () => setCursor(null) },
      { at: 15500, action: () => setToast(null) },
      {
        at: 16800,
        action: () => {
          setTasks(TASKS_HOME.map((t) => ({ ...t })));
          setActiveTab('home');
          setToast(null);
          setPush(null);
        },
      },
    ];
    const timers = timeline.map((tl) => setTimeout(tl.action, tl.at));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  // Loop
  useEffect(() => {
    const id = setTimeout(() => setStep((s) => s + 1), 17800);
    return () => clearTimeout(id);
  }, [step]);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="kl-phone" aria-label="Aperçu de l'application Klaro">
      <div className="kl-phone-screen">
        {/* Status bar */}
        <div className="kl-phone-status">
          <span>{statusTime}</span>
          <span className="kl-icons">
            <Ic name="signal" size={11} sw={2.4} />
            <Ic name="wifi" size={11} sw={2.4} />
            <Ic name="battery" size={14} sw={1.6} />
          </span>
        </div>

        {/* Push notification */}
        {push && (
          <div className="kl-push-notif">
            <div className="kl-push-app">
              <span className="kl-push-k">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#00b89c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 4v16M7 12l9-8M7 12l9 8" />
                </svg>
              </span>
              <span className="kl-push-name">{push.t}</span>
              <span className="kl-push-now">maintenant</span>
            </div>
            <div className="kl-push-msg">{push.s}</div>
          </div>
        )}

        <div className="kl-app">
          {/* App header */}
          <div className="kl-app-head">
            <div>
              <div className="kl-greet">Bonjour Florent · jeudi 8 mai</div>
              <div className="kl-name">Maison Florent</div>
            </div>
            <button className={`kl-app-bell ${bellRing ? 'kl-ringing' : ''}`} type="button" aria-label="Alertes">
              <Ic name="bell" size={15} sw={1.8} />
              {alertCount > 0 && <span className="kl-badge">{alertCount}</span>}
            </button>
          </div>

          {/* Body */}
          <div className="kl-app-body">
            {activeTab === 'home' && (
              <>
                <div className={`kl-score-card ${scoreBoost ? 'kl-boost' : ''}`}>
                  <Ring value={score} />
                  <div className="kl-info">
                    <div className="kl-lab">Score chantier</div>
                    <div className="kl-title">{score >= 75 ? 'Bon avancement' : score >= 50 ? 'À surveiller' : 'En tension'}</div>
                    <div className="kl-meta">
                      {done}/{total} tâches finies · <span className="kl-alert-mark">{alertCount} alerte{alertCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {scoreBoost && <span className="kl-score-bump">+12</span>}
                </div>

                {blocking > 0 && (
                  <div className="kl-alert-banner" onClick={() => setActiveTab('alerts')} role="button" tabIndex={0}>
                    <div className="kl-ic">
                      <Ic name="warn" size={14} sw={2.4} />
                    </div>
                    <div className="kl-txt">
                      <div className="kl-t">Klaro a détecté un blocage</div>
                      <div className="kl-s">Photographier les réseaux avant que le plaquiste ferme</div>
                    </div>
                    <span className="kl-arrow">
                      <Ic name="arrow" size={14} sw={2.2} />
                    </span>
                  </div>
                )}

                <div className="kl-sec-lab">
                  <span>Klaro vous recommande</span>
                  <span className="kl-count">{total - done} à faire</span>
                </div>

                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className={`kl-task ${t.done ? 'kl-done' : ''} ${t.blocking ? 'kl-blocking' : ''} ${t.justDone ? 'kl-just-done' : ''}`}
                    onClick={() => toggleTask(t.id)}
                  >
                    <div className="kl-check">
                      <Ic name="check" size={12} sw={3} />
                    </div>
                    <div className="kl-task-info">
                      <div className="kl-task-name">{t.name}</div>
                      {t.why && !t.done && (
                        <div className="kl-why">
                          {t.blocking && <Ic name="warn" size={10} sw={2.4} />} {t.why}
                        </div>
                      )}
                      {t.done && (
                        <div className="kl-why" style={{ color: 'var(--kl-accent-dark)' }}>
                          <Ic name="check" size={10} sw={2.6} /> Fait
                        </div>
                      )}
                    </div>
                    <span className={`kl-tag ${t.tagClass}`}>{t.tag}</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'alerts' && (
              <div className="kl-alerts-view">
                <div className="kl-alerts-head">
                  <div className="kl-alerts-count">{alertCount}</div>
                  <div>
                    <div className="kl-alerts-title">Alerte{alertCount > 1 ? 's' : ''} en cours</div>
                    <div className="kl-alerts-sub">Klaro priorise pour vous</div>
                  </div>
                </div>
                {ALERTS_VIEW.slice(0, alertCount === 0 ? 0 : alertCount + 1).map((a, i) => (
                  <div key={i} className={`kl-alert-row kl-alert-${a.level} ${i === 0 ? 'kl-highlighted' : ''}`}>
                    <div className="kl-al-tag">{a.tag}</div>
                    <div className="kl-al-title">{a.title}</div>
                    <div className="kl-al-sub">{a.sub}</div>
                    <div className="kl-al-cta">
                      Voir <Ic name="arrow" size={11} sw={2.4} />
                    </div>
                  </div>
                ))}
                {alertCount === 0 && (
                  <div className="kl-alerts-empty">
                    <Ic name="check" size={22} sw={2.4} color="#00b89c" />
                    <div>Tout est sous contrôle</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="kl-sec-lab">
                  <span>Toutes les tâches</span>
                  <span className="kl-count">{tasks.length}</span>
                </div>
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className={`kl-task ${t.done ? 'kl-done' : ''} ${t.blocking ? 'kl-blocking' : ''}`}
                    onClick={() => toggleTask(t.id)}
                  >
                    <div className="kl-check">
                      <Ic name="check" size={12} sw={3} />
                    </div>
                    <div className="kl-task-info">
                      <div className="kl-task-name">{t.name}</div>
                    </div>
                    <span className={`kl-tag ${t.tagClass}`}>{t.tag}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'docs' && (
              <div>
                <div className="kl-sec-lab">
                  <span>Documents</span>
                  <span className="kl-count">8</span>
                </div>
                {[
                  { n: 'Devis électricité.pdf', s: '2 mai' },
                  { n: 'Photo gaines avant placo.jpg', s: '5 mai' },
                  { n: 'Facture plomberie.pdf', s: '7 mai' },
                ].map((d, i) => (
                  <div key={i} className="kl-doc-row">
                    <Ic name="doc" size={16} sw={1.6} />
                    <div className="kl-doc-info">
                      <div className="kl-doc-n">{d.n}</div>
                      <div className="kl-doc-s">{d.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="kl-app-nav">
            {TABS.map((t) => (
              <div
                key={t.id}
                className={`kl-app-nav-item ${activeTab === t.id ? 'kl-active' : ''} ${navHighlight === t.id ? 'kl-highlight' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <Ic name={t.icon} size={18} sw={1.9} />
                <span>{t.name.replace('Mes ', '').replace('Tableau de bord', 'Accueil')}</span>
                {t.id === 'alerts' && alertCount > 0 && <span className="kl-nav-badge">{alertCount}</span>}
              </div>
            ))}
          </div>

          {/* Touch cursor */}
          {cursor && (
            <div
              className={`kl-touch-cursor ${cursor.tap ? 'kl-tapping' : ''}`}
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
            >
              <div className="kl-touch-ring" />
              <div className="kl-touch-dot" />
              {cursor.tap && <div className="kl-touch-impact" />}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`kl-toast kl-toast-${toast.kind}`} key={toast.t + toast.s}>
          <div className="kl-toast-ic">
            {toast.kind === 'ok' ? <Ic name="check" size={14} sw={2.6} /> : <Ic name="warn" size={14} sw={2.4} />}
          </div>
          <div>
            <div className="kl-toast-t">{toast.t}</div>
            <div className="kl-toast-s">{toast.s}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="kl-logo" aria-label="Klaro accueil">
      <KMark size={32} radius={9} />
      <span className="kl-wordmark">laro</span>
    </Link>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`kl-header ${scrolled ? 'scrolled' : ''}`}>
      <Logo />
      <nav className="kl-nav" aria-label="Navigation principale">
        <a href="#fonctionnement" className="kl-hide-sm">Fonctionnement</a>
        <Link href="/offres" className="kl-hide-sm">Offres</Link>
        <Link href="/faq" className="kl-hide-sm">FAQ</Link>
        <Link href="/connexion" className="kl-signin kl-hide-sm">Se connecter</Link>
        <Link href="/inscription" className="kl-cta">S&apos;inscrire</Link>
      </nav>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="kl-root">
      <Header />

      <section className="kl-hero">
        <div className="kl-hero-left">
          <h1>
            Votre chantier,
            <br />
            enfin <span className="kl-accent">sous contrôle.</span>
          </h1>
          <p className="kl-hero-sub">
            Klaro vous dit <strong>quoi faire</strong>, <strong>quand le faire</strong>, et vous évite
            les erreurs qui coûtent cher. Sans être du métier, vous gardez le contrôle.
          </p>
          <div className="kl-hero-actions">
            <Link href="/inscription" className="kl-btn kl-btn-primary">
              Commencer mon chantier <Ic name="arrow" size={14} sw={2.4} />
            </Link>
            <a href="#fonctionnement" className="kl-btn kl-btn-ghost">Voir la démo</a>
          </div>
          <div className="kl-hero-trust">
            <div className="kl-dots">
              <span className="kl-dot">F</span>
              <span className="kl-dot">S</span>
              <span className="kl-dot">K</span>
            </div>
            <div>
              <strong>Plus de 200 chantiers</strong> pilotés avec Klaro · 4,8/5
            </div>
          </div>
        </div>

        <div className="kl-hero-right">
          <PhoneDemo />
        </div>
      </section>

      <section className="kl-how" id="fonctionnement">
        <div className="kl-how-inner">
          <div className="kl-how-eyebrow">Comment ça marche</div>
          <h2>
            Klaro vous guide à <span className="kl-accent">chaque étape.</span>
          </h2>
          <p className="kl-how-sub">
            Un seul tableau de bord. Le bon ordre. Les bonnes étapes. Les bonnes alertes.
          </p>
          <div className="kl-how-grid">
            <div className="kl-how-card">
              <div className="kl-num">01 / Vous décrivez</div>
              <h3>Votre chantier en 2 min</h3>
              <p>
                Type de travaux, surface, corps de métier impliqués. Klaro construit votre plan dans le bon
                ordre — sans jargon.
              </p>
            </div>
            <div className="kl-how-card">
              <div className="kl-num">02 / Klaro pilote</div>
              <h3>Une priorité à la fois</h3>
              <p>
                Chaque jour, Klaro vous dit la prochaine action à faire. Validez d&apos;un clic, prenez une
                photo, le score se met à jour.
              </p>
            </div>
            <div className="kl-how-card">
              <div className="kl-num">03 / Vous voyez clair</div>
              <h3>Zéro mauvaise surprise</h3>
              <p>
                Retards, blocages, dépendances oubliées : Klaro les voit avant vous et vous alerte en rouge —
                pour que rien ne dérape.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="kl-cta-band">
        <h2>
          Organisez votre chantier <span className="kl-accent">dès aujourd&apos;hui.</span>
        </h2>
        <p>Gratuit pour commencer. Sans carte bancaire. Sans engagement.</p>
        <Link href="/inscription" className="kl-btn kl-btn-primary">
          Commencer mon chantier <Ic name="arrow" size={14} sw={2.4} />
        </Link>
      </section>

      <footer className="kl-foot">
        <span>© {new Date().getFullYear()} Klaro — Voir clair sur son chantier.</span>
        <div className="kl-foot-links">
          <Link href="/offres">Offres</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgu">CGU</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
