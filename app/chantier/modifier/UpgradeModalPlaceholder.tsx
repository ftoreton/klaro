'use client';

import { useEffect } from 'react';
import { CreditCard, Lock, X } from 'lucide-react';
import { PALIER_LABEL, type Palier } from '@/lib/pricing/types';

interface Props {
  open: boolean;
  tradeLabel: string;
  currentPalier: Palier;
  nextPalier: Palier;
  diffCents: number;
  onClose: () => void;
}

function formatEuros(cents: number): string {
  const euros = cents / 100;
  return euros % 1 === 0 ? `${euros}€` : `${euros.toFixed(2)}€`;
}

// Placeholder pour la modal d'upgrade. Remplacée par la vraie modal Stripe
// dans le module Pricing. Le bouton "Payer" est désactivé ici et affiche
// un message explicatif. La modal s'ouvre, l'user peut annuler ou attendre
// le module Pricing.
export default function UpgradeModalPlaceholder({
  open,
  tradeLabel,
  currentPalier,
  nextPalier,
  diffCents,
  onClose,
}: Props) {
  // Échap pour fermer + bloque le scroll du body quand ouvert
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const newCount =
    nextPalier === 'palier_4_7' ? 4 : nextPalier === 'palier_8_plus' ? 8 : 1;

  return (
    <div className="upm-root" role="dialog" aria-modal="true" aria-labelledby="upm-title">
      <div className="upm-backdrop" onClick={onClose} aria-hidden />

      <div className="upm-card">
        <button type="button" className="upm-close" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>

        <h2 id="upm-title" className="upm-title">
          Tu veux ajouter <span className="upm-trade">«&nbsp;{tradeLabel}&nbsp;»</span>
        </h2>

        <p className="upm-text">
          Cela fait passer ton chantier à <strong>{newCount} corps de métier ou plus</strong>.
          Tu passes du palier <strong>{PALIER_LABEL[currentPalier]}</strong> au palier{' '}
          <strong>{PALIER_LABEL[nextPalier]}</strong>.
        </p>

        <div className="upm-price">
          <span className="upm-price-label">Différence à payer</span>
          <span className="upm-price-value">+{formatEuros(diffCents)}</span>
        </div>

        <div className="upm-notice" role="note">
          <Lock size={14} />
          <span>
            Cette fonctionnalité sera disponible après la mise en place du paiement (module Pricing).
            En attendant, tu peux fermer cette fenêtre — ton chantier n’a pas été modifié.
          </span>
        </div>

        <div className="upm-actions">
          <button type="button" className="upm-btn upm-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="upm-btn upm-btn-primary"
            disabled
            title="Le paiement Stripe arrive avec le module Pricing"
          >
            <CreditCard size={14} />
            Payer {formatEuros(diffCents)} et ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
