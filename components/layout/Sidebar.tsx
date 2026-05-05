'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';

const NAV_ITEMS = [
  { id: 'dashboard', href: '/dashboard', name: 'Tableau de bord', icon: 'home' as const },
  { id: 'alertes', href: '/alertes', name: 'Alertes', icon: 'bell' as const },
  { id: 'taches', href: '/taches', name: 'Tâches', icon: 'list' as const },
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
    </aside>
  );
}
