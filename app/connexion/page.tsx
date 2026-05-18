'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import MarketingShell from '@/components/marketing/MarketingShell';
import GoogleButton from '@/components/auth/GoogleButton';
import { createClient } from '@/lib/supabase/client';

function ConnexionForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get('redirect') ?? '/dashboard';
  const queryError = search.get('error');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    queryError === 'auth_callback_failed'
      ? "La connexion via Google n'a pas abouti. Réessayez."
      : null,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('pwd') ?? '');

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setSubmitting(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mk-auth-wrap">
      <div className="mk-auth-card">
        <div className="mk-auth-head">
          <Link href="/" className="mk-logo" aria-label="Klaro accueil">
            <span className="mk-logo-mark">K</span>
            <span className="mk-logo-name">Klar<span className="o">o</span></span>
          </Link>
          <h1 className="mk-auth-title">Bon retour sur ton chantier</h1>
          <p className="mk-auth-sub">Connecte-toi pour reprendre où tu en étais</p>
        </div>

        <GoogleButton next={redirect} />

        <div className="mk-auth-divider"><span>ou</span></div>

        <form className="mk-form" onSubmit={onSubmit}>
          <div className="mk-field">
            <label className="mk-label" htmlFor="email">Email</label>
            <input id="email" name="email" className="mk-input" type="email" autoComplete="email" required />
          </div>

          <div className="mk-field">
            <label className="mk-label" htmlFor="pwd">Mot de passe</label>
            <input id="pwd" name="pwd" className="mk-input" type="password" autoComplete="current-password" required />
          </div>

          <div className="mk-form-row">
            <span />
            <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          </div>

          {error && <div className="mk-auth-error">{error}</div>}

          <button type="submit" className="mk-submit" disabled={submitting}>
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="mk-auth-footer">
          Pas encore de compte ?<Link href="/inscription">S&apos;inscrire gratuitement</Link>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <MarketingShell>
      <Suspense fallback={null}>
        <ConnexionForm />
      </Suspense>
    </MarketingShell>
  );
}
