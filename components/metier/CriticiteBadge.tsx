'use client';

import { AlertTriangle, AlertOctagon } from 'lucide-react';
import type { NiveauCriticite } from '@/lib/metier/types';

export default function CriticiteBadge({ niveau }: { niveau: NiveauCriticite }) {
  if (niveau === 'normal') return null;

  if (niveau === 'important') {
    return (
      <span className="mt-badge mt-badge-important" aria-label="Étape importante">
        <AlertTriangle size={12} strokeWidth={2.5} />
        Important
      </span>
    );
  }

  return (
    <span className="mt-badge mt-badge-critique" aria-label="Étape critique">
      <AlertOctagon size={12} strokeWidth={2.5} />
      Étape critique
    </span>
  );
}
