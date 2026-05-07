'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';

const NAV_ITEMS = [
  { id: 'dashboard', href: '/dashboard', name: 'Tableau de bord', icon: 'home' as const },
  { id: 'alertes', href: '/alertes', name: 'Alertes', icon: 'bell' as const },
  { id: 'taches', href: '/taches', name: 'Tâches', icon: 'list' as const },
  { id: 'metiers', href: '/metiers/electricite', name: 'Vue par métier', icon: 'list' as const },
  { id: 'cal', href: '/calendrier', name: 'Calendrier', icon: 'cal' as const },
  { id: 'budget', href: '/budget', name: 'Budget', icon: 'euro' as const },
  { id: 'devis', href: '/devis', name: 'Devis', icon: 'doc' as const },
  { id: 'docs', href: '/documents', name: 'Documents', icon: 'doc' as const },
  { id: 'msg', href: '/messages', name: 'Messages', icon: 'msg' as const },
];

interface SidebarProps {
  alertCount?: number;
}

export default function Sidebar({ alertCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="kb-side">
      <div className="kb-side-logo">
        <span className="mark">k<span className="o">·</span></span>
        <Logo size={16} />
      </div>

      <div className="kb-side-section">Navigation</div>

      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`kb-side-item ${isActive ? 'active' : ''}`}
          >
            <span className="ic">
              <Icon name={item.icon} size={15} />
            </span>
            <span>{item.name}</span>
            {item.id === 'alertes' && alertCount > 0 && (
              <span className="badge">{alertCount}</span>
            )}
          </Link>
        );
      })}

      <form action="/auth/sign-out" method="post" className="kb-side-footer">
        <button type="submit" className="kb-side-item kb-side-signout">
          <span className="ic">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span>Se déconnecter</span>
        </button>
      </form>
    </aside>
  );
}
