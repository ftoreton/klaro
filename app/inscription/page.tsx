'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MarketingShell from '@/components/marketing/MarketingShell';
import GoogleButton from '@/components/auth/GoogleButton';
import { createClient } from '@/lib/supabase/client';

export default function InscriptionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const formData = new FormData(e.currentTarget);
    const prenom = String(formData.get('prenom') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('pwd') ?? '');
    const password2 = String(formData.get('pwd2') ?? '');

    if (password !== password2) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        data: { prenom },
      },
    });

    if (signUpError) {
      setSubmitting(false);
      setError(signUpError.message);
      return;
    }

    // Selon la config Supabase, l'email de confirmation est envoyé OU pas.
    // Si une session existe déjà → on enchaîne directement sur l'onboarding.
    if (data.session) {
      router.push('/onboarding');
    } else {
      setSubmitting(false);
      setInfo(
        "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis revenez vous connecter.",
      );
    }
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

          <GoogleButton next="/onboarding" />

          <div className="mk-auth-divider"><span>ou</span></div>

          <form className="mk-form" onSubmit={onSubmit}>
            <div className="mk-field">
              <label className="mk-label" htmlFor="prenom">Prénom</label>
              <input id="prenom" name="prenom" className="mk-input" type="text" autoComplete="given-name" required />
            </div>

            <div className="mk-field">
              <label className="mk-label" htmlFor="email">Email</label>
              <input id="email" name="email" className="mk-input" type="email" autoComplete="email" required />
            </div>

            <div className="mk-field">
              <label className="mk-label" htmlFor="pwd">Mot de passe</label>
              <input id="pwd" name="pwd" className="mk-input" type="password" autoComplete="new-password" minLength={8} required />
            </div>

            <div className="mk-field">
              <label className="mk-label" htmlFor="pwd2">Confirmer le mot de passe</label>
              <input id="pwd2" name="pwd2" className="mk-input" type="password" autoComplete="new-password" minLength={8} required />
            </div>

            {error && <div className="mk-auth-error">{error}</div>}
            {info && <div className="mk-auth-info">{info}</div>}

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
