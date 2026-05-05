'use client';

import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import type { Alert } from '@/lib/types';

interface AlertStripProps {
  alert: Alert;
}

export default function AlertStrip({ alert }: AlertStripProps) {
  const isDanger = alert.score >= 50;

  return (
    <div className={`alert-strip ${isDanger ? 'danger' : ''}`}>
      <div className="ic">
        <Icon name="warn" size={15} />
      </div>
      <div className="txt">
        <div className="t">{alert.titre}</div>
        <div className="s">{alert.explication}</div>
      </div>
      <Link href="/alertes" className="act">
        Traiter <Icon name="arrow" size={11} />
      </Link>
    </div>
  );
}
