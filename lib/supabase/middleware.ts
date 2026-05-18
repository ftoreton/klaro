import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes qui nécessitent d'être connecté.
// Tout le reste est public.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/alertes',
  '/taches',
  '/estimation',
  '/calendrier',
  '/budget',
  '/devis',
  '/documents',
  '/messages',
  '/metiers',
  '/chantier',
  '/parametres',
];

// Routes auth — si on est déjà connecté, on redirige vers /dashboard.
const AUTH_PREFIXES = ['/connexion', '/inscription'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ne PAS exécuter de code entre createServerClient et getUser().
  // Sinon les sessions sont mal rafraîchies (cf. doc Supabase SSR).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`),
  );

  const isAuthPage = AUTH_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`),
  );

  // Pas connecté + page protégée → redirige vers /connexion
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Connecté + page d'auth → redirige vers /dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
