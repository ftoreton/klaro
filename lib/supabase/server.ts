import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Client Supabase pour les Server Components et Route Handlers.
// Lit la session de l'utilisateur depuis les cookies HTTP.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component (lecture seule) : tentative ignorée.
            // La session sera rafraîchie par le middleware au prochain request.
          }
        },
      },
    },
  );
}
