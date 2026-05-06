'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MarketingShell from '@/components/marketing/MarketingShell';

export default function ConnexionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => router.push('/dashboard'), 250);
  }

  return (
    <MarketingShell>
      <div className="mk-auth-wrap">
        <div className="mk-auth-card">
          <div className="mk-auth-head">
            <Link href="/" className="mk-logo" aria-label="Klaro accueil">
              <span className="mk-logo-mark">K</span>
              <span className="mk-logo-name">Klar<span className="o">o</span></span>
            </Link>
            <h1 className="mk-auth-title">Bon retour sur votre chantier</h1>
            <p className="mk-auth-sub">Connectez-vous pour reprendre où vous en étiez</p>
          </div>

          <form className="mk-form" onSubmit={onSubmit}>
            <div className="mk-field">
              <label className="mk-label" htmlFor="email">Email</label>
              <input id="email" className="mk-input" type="email" autoComplete="email" required />
            </div>

            <div className="mk-field">
              <label className="mk-label" htmlFor="pwd">Mot de passe</label>
              <input id="pwd" className="mk-input" type="password" autoComplete="current-password" required />
            </div>

            <div className="mk-form-row">
              <span />
              <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
            </div>

            <button type="submit" className="mk-submit" disabled={submitting}>
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="mk-auth-footer">
            Pas encore de compte ?<Link href="/inscription">S&apos;inscrire gratuitement</Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
