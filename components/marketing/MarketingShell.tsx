'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="mk-root">
      <header className="mk-nav">
        <div className="mk-nav-inner">
          <Link href="/" className="mk-logo" aria-label="Klaro accueil">
            <span className="mk-logo-mark">K</span>
            <span className="mk-logo-name">Klar<span className="o">o</span></span>
          </Link>

          <nav className="mk-nav-links" aria-label="Navigation principale">
            <Link href="/#fonctionnement" className={pathname === '/' ? 'is-active' : ''}>Fonctionnement</Link>
            <Link href="/offres" className={pathname === '/offres' ? 'is-active' : ''}>Offres</Link>
            <Link href="/faq" className={pathname === '/faq' ? 'is-active' : ''}>FAQ</Link>
          </nav>

          <div className="mk-nav-cta">
            <Link href="/connexion" className="mk-btn mk-btn-ghost">Se connecter</Link>
            <Link href="/inscription" className="mk-btn mk-btn-dark">S'inscrire</Link>
          </div>

          <button
            className="mk-nav-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>

        {open && (
          <div className="mk-nav-mobile" onClick={() => setOpen(false)}>
            <Link href="/#fonctionnement">Fonctionnement</Link>
            <Link href="/offres">Offres</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/connexion" className="mk-btn mk-btn-ghost">Se connecter</Link>
            <Link href="/inscription" className="mk-btn mk-btn-dark">S'inscrire</Link>
          </div>
        )}
      </header>

      <main className="mk-main">{children}</main>

      <footer className="mk-footer">
        <div className="mk-footer-inner">
          <div className="mk-footer-brand">
            <Link href="/" className="mk-logo mk-logo-light">
              <span className="mk-logo-mark">K</span>
              <span className="mk-logo-name">Klar<span className="o">o</span></span>
            </Link>
            <p className="mk-footer-tagline">Voir clair sur son chantier.</p>
          </div>

          <div className="mk-footer-cols">
            <div>
              <div className="mk-footer-title">Produit</div>
              <Link href="/offres">Offres</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/inscription">Créer un compte</Link>
            </div>
            <div>
              <div className="mk-footer-title">Légal</div>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/cgu">CGU</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>

        <div className="mk-footer-bottom">
          <span>© {new Date().getFullYear()} Klaro — Tous droits réservés.</span>
          <span className="mk-footer-built">Conçu pour les particuliers qui rénovent.</span>
        </div>
      </footer>
    </div>
  );
}
