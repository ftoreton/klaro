import { redirect } from 'next/navigation';
import { getCurrentProject, getCurrentUser } from '@/lib/supabase/queries';
import { loadAllTrades } from '@/lib/onboarding/loader';
import OnboardingFlow from './OnboardingFlow';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/onboarding');

  const existing = await getCurrentProject();
  if (existing) redirect('/dashboard');

  const prenom = (user.user_metadata?.prenom as string | undefined) ?? null;
  const trades = loadAllTrades();

  return <OnboardingFlow firstName={prenom} trades={trades} />;
}
