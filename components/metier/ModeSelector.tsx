'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { NIVEAU_LABEL, NIVEAU_TO_MODE, type NiveauUtilisateur } from '@/lib/niveau/types';
import type { ModeUtilisateur } from '@/lib/metier/types';

const MODE_LABEL: Record<ModeUtilisateur, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  expert: 'Expert',
};

interface Props {
  niveau: NiveauUtilisateur;
}

// Bandeau read-only : affiche le niveau de l'user (auto-déclaré à l'onboarding)
// et le mode d'affichage qui en découle. La modification se fait depuis /parametres.
export default function ModeSelector({ niveau }: Props) {
  const mode = NIVEAU_TO_MODE[niveau];
  const { titre } = NIVEAU_LABEL[niveau];

  return (
    <div className="mt-niveau-badge" role="status" aria-label="Votre niveau bricoleur">
      <div className="mt-niveau-badge-text">
        <span className="mt-niveau-badge-label">Votre niveau</span>
        <span className="mt-niveau-badge-value">{titre}</span>
        <span className="mt-niveau-badge-mode">Affichage : {MODE_LABEL[mode]}</span>
      </div>
      <Link href="/parametres" className="mt-niveau-badge-link" aria-label="Modifier dans les paramètres">
        <Settings size={14} />
        <span>Modifier</span>
      </Link>
    </div>
  );
}
