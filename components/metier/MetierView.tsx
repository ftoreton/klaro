'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metier } from '@/lib/metier/types';
import { useMetierStore } from '@/lib/metier/store';
import { metierProgress } from '@/lib/metier/progress';
import { NIVEAU_TO_MODE, type NiveauUtilisateur } from '@/lib/niveau/types';
import EtapeCard from './EtapeCard';
import EtapeDetailDrawer from './EtapeDetailDrawer';
import ModeSelector from './ModeSelector';
import ProgressBar from './ProgressBar';
import './metier.css';

interface Props {
  metier: Metier;
  niveau: NiveauUtilisateur;
}

export default function MetierView({ metier, niveau }: Props) {
  const mode = NIVEAU_TO_MODE[niveau];
  const applyOverlay = useMetierStore((s) => s.applyOverlay);
  const [openEtapeId, setOpenEtapeId] = useState<string | null>(null);

  const live = applyOverlay(metier);
  const { done, total, pct } = metierProgress(live.etapes);
  const openEtape = openEtapeId ? live.etapes.find((e) => e.id === openEtapeId) ?? null : null;

  return (
    <div className="mt-root">
      <div className="mt-container">
        {/* Header */}
        <header className="mt-header">
          <Link href="/dashboard" className="mt-back">
            <ArrowLeft size={14} />
            Retour au tableau de bord
          </Link>

          <div className="mt-header-row">
            <div>
              <h1 className="mt-h1">{live.nom}</h1>
              <p className="mt-subtitle">{live.description_simple}</p>
            </div>

            <ModeSelector niveau={niveau} />
          </div>

          <ProgressBar done={done} total={total} pct={pct} />
        </header>

        {/* Liste d'étapes */}
        <main className="mt-etapes-list">
          {live.etapes.map((etape, i) => (
            <EtapeCard
              key={etape.id}
              metierId={live.id}
              etape={etape}
              index={i}
              mode={mode}
              onOpen={(id) => setOpenEtapeId(id)}
            />
          ))}
        </main>
      </div>

      <EtapeDetailDrawer
        metierId={live.id}
        etape={openEtape}
        mode={mode}
        onClose={() => setOpenEtapeId(null)}
      />
    </div>
  );
}
