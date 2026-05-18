'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import type { EstimationResult } from '@/lib/estimation/types';

interface Props {
  estimation: EstimationResult;
}

export default function EstimationCard({ estimation }: Props) {
  const isUnavailable = estimation.confiance === 'indisponible';

  return (
    <Link href="/estimation" className="db-est">
      <div className="db-est-ic" aria-hidden>
        <CalendarClock size={20} />
      </div>

      <div className="db-est-body">
        <div className="db-est-label">Estimation chantier</div>

        {isUnavailable ? (
          <div className="db-est-text">
            Calibration en cours — bientôt disponible
          </div>
        ) : (
          <div className="db-est-text">
            <strong>~{estimation.delai_central_mois} mois</strong>
            <span className="db-est-range">
              (entre {estimation.borne_basse_mois} et {estimation.borne_haute_mois} mois)
            </span>
          </div>
        )}
      </div>

      <div className="db-est-cta" aria-hidden>
        <span>Voir le détail</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}
