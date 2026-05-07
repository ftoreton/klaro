import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Callback pour OAuth (Google) ET pour la confirmation d'email.
// Supabase redirige ici avec un `code` après l'auth → on l'échange contre une session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Si on est derrière un proxy (Netlify, Vercel), garder le bon host.
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Erreur ou code manquant → on renvoie sur la page de connexion avec un message.
  return NextResponse.redirect(`${origin}/connexion?error=auth_callback_failed`);
}
