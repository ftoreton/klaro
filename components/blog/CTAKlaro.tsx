import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  variant?: 'middle' | 'end';
}

// CTA inséré dans les articles MDX. Deux variantes :
// - 'middle' : encart compact au milieu de l'article
// - 'end' : encart plus visuel en fin d'article
// Mène vers /onboarding (le middleware redirige vers /connexion si non auth).
export default function CTAKlaro({ variant = 'middle' }: Props) {
  return (
    <aside className={`blog-cta blog-cta-${variant}`} aria-label="Découvrir Klaro">
      <div className="blog-cta-icon" aria-hidden>
        <span className="blog-cta-mark">K</span>
      </div>

      <div className="blog-cta-body">
        <p className="blog-cta-title">
          Tu prévois une rénovation comme celle décrite dans cet article&nbsp;?
        </p>
        <p className="blog-cta-text">
          Klaro t&apos;aide à t&apos;organiser, estimer ton planning, et ne rien oublier.
        </p>
      </div>

      <Link href="/onboarding" className="blog-cta-btn">
        Essayer Klaro — 19€
        <ArrowRight size={14} />
      </Link>
    </aside>
  );
}
