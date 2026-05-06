'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MarketingShell from '@/components/marketing/MarketingShell';

export default function InscriptionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => router.push('/questionnaire'), 250);
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
            <h1 className="mk-auth-title">Bienvenue sur Klaro</h1>
            <p className="mk-auth-sub">Créez votre compte gratuitement</p>
          </div>

          <form className="mk-form" onSubmit={onSubmit}>
            <div className="mk-field">
              <label className="mk-label" htmlFor="prenom">Prénom</label>
              <input id="prenom" className="mk-input" type="text" autoComplete="given-name" required />
            </div>

            <div className="mk-field">
              <label className="mk-label" htmlFor="email">Email</label>
              <input id="email" className="mk-input" type="email" autoComplete="email" required />
            </div>

            <div className="mk-field">
              <label className="mk-label" htmlFor="pwd">Mot de passe</label>
              <input id="pwd" className="mk-input" type="password" autoComplete="new-password" minLength={8} required />
            </div>

            <div className="mk-field">
              <label className="mk-label" htmlFor="pwd2">Confirmer le mot de passe</label>
              <input id="pwd2" className="mk-input" type="password" autoComplete="new-password" minLength={8} required />
            </div>

            <button type="submit" className="mk-submit" disabled={submitting}>
              {submitting ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mk-auth-footer">
            Déjà inscrit ?<Link href="/connexion">Se connecter</Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
