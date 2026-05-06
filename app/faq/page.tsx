'use client';

import Link from 'next/link';
import { useState } from 'react';
import MarketingShell from '@/components/marketing/MarketingShell';

interface FaqItem {
  q: string;
  a: string;
  cat: 'Klaro' | 'Utilisation' | 'Offres';
}

const FAQ: FaqItem[] = [
  {
    cat: 'Klaro',
    q: 'Klaro remplace-t-il un artisan ?',
    a: "Non. Klaro ne remplace pas un professionnel. Il aide à mieux comprendre, organiser et suivre un chantier. Pour toute intervention engageant la sécurité (gaz, élec, structure), un pro qualifié reste obligatoire.",
  },
  {
    cat: 'Klaro',
    q: 'Klaro est-il adapté aux débutants ?',
    a: "Oui. Les étapes sont expliquées simplement, sans jargon inutile. Quand un terme technique est nécessaire, Klaro l'explique en quelques mots.",
  },
  {
    cat: 'Utilisation',
    q: 'Puis-je utiliser Klaro si je fais les travaux moi-même ?',
    a: "Oui. Klaro est justement conçu pour guider les particuliers étape par étape, dans le bon ordre, avec les recommandations de chaque corps de métier.",
  },
  {
    cat: 'Utilisation',
    q: 'Puis-je utiliser Klaro avec des artisans ?',
    a: "Oui. Klaro permet de mieux suivre ce qui est prévu, ce qui est fait et ce qui reste à vérifier. Vous gardez le contrôle, même sans expertise BTP.",
  },
  {
    cat: 'Offres',
    q: "L'offre Pro est-elle un abonnement ?",
    a: "Non. L'offre Pro est facturée 39 € par chantier, une seule fois. Pas d'abonnement, pas de prélèvement automatique, pas de surprise.",
  },
  {
    cat: 'Offres',
    q: 'Que contient l\'offre gratuite ?',
    a: "Elle permet de tester Klaro avec un accès limité aux fonctionnalités : un chantier test, quelques checklists et un score basique. Idéale pour voir si l'outil correspond à votre projet.",
  },
  {
    cat: 'Offres',
    q: 'Que contient l\'offre Pro ?',
    a: "Elle donne accès aux modules métiers complets, aux checklists détaillées, aux recommandations Klaro, aux erreurs à éviter, au score chantier complet, aux photos par tâche et à la planification.",
  },
  {
    cat: 'Klaro',
    q: 'Klaro vérifie-t-il la conformité technique ?',
    a: "Klaro donne des recommandations et bonnes pratiques basées sur les DTU et règles métier, mais ne remplace pas un contrôle professionnel obligatoire comme le Consuel pour l'électricité, l'attestation Qualigaz pour le gaz, ou les contrôles SPANC pour l'assainissement.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(FAQ[0].q);

  function toggle(q: string) {
    setOpen((prev) => (prev === q ? null : q));
  }

  // Group by category preserving order
  const grouped: Record<string, FaqItem[]> = {};
  FAQ.forEach((item) => {
    if (!grouped[item.cat]) grouped[item.cat] = [];
    grouped[item.cat].push(item);
  });

  return (
    <MarketingShell>
      <section className="mk-section">
        <div className="mk-container-narrow">
          <div className="mk-section-head" style={{ marginBottom: 36 }}>
            <span className="mk-eyebrow">Aide</span>
            <h1 className="mk-h2" style={{ marginTop: 18 }}>Questions fréquentes</h1>
            <p className="mk-section-sub">
              Tout ce qu&apos;il faut savoir avant de démarrer votre chantier avec Klaro.
            </p>
          </div>

          <div className="mk-faq-list">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="mk-faq-cat-label">{cat}</div>
                {items.map((item) => (
                  <details
                    key={item.q}
                    className="mk-faq-item"
                    open={open === item.q}
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(item.q);
                    }}
                  >
                    <summary className="mk-faq-summary">{item.q}</summary>
                    <div className="mk-faq-answer">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <h3 className="mk-h3" style={{ fontSize: 20 }}>Vous n&apos;avez pas trouvé votre réponse ?</h3>
            <p style={{ color: 'var(--fg-2)', fontSize: 14, margin: '0 0 20px' }}>
              L&apos;équipe Klaro répond généralement sous 24 h.
            </p>
            <Link href="/contact" className="mk-btn mk-btn-outline">
              Contacter Klaro
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
