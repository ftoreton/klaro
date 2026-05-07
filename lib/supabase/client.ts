import { createBrowserClient } from '@supabase/ssr';

// Client Supabase pour le navigateur (Client Components, événements UI).
// La clé publishable est sûre côté client — toutes les écritures sensibles
// passent par les Row Level Security policies de Supabase.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
