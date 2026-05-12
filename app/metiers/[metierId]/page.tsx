import { notFound } from 'next/navigation';
import MetierView from '@/components/metier/MetierView';
import electricite from '@/data/metiers-seed/electricite';
import type { Metier } from '@/lib/metier/types';
import { getCurrentNiveauOrFallback } from '@/lib/niveau/queries';

const METIERS: Record<string, Metier> = {
  electricite,
};

export function generateStaticParams() {
  return Object.keys(METIERS).map((metierId) => ({ metierId }));
}

export default async function MetierPage({
  params,
}: {
  params: Promise<{ metierId: string }>;
}) {
  const { metierId } = await params;
  const metier = METIERS[metierId];
  if (!metier) notFound();

  const niveau = await getCurrentNiveauOrFallback();

  return <MetierView metier={metier} niveau={niveau} />;
}
