'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';

const NAV_ITEMS = [
  { id: 'dashboard', href: '/dashboard', name: 'Accueil', icon: 'home' as const },
  { id: 'taches', href: '/taches', name: 'Tâches', icon: 'list' as const },
  { id: 'alertes', href: '/alertes', name: 'Alertes', icon: 'bell' as const },
  { id: 'cam', href: '/photo', name: 'Photo', icon: 'cam' as const },
];

interface MobileNavProps {
  alertCount?: number;
}

export default function MobileNav({ alertCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '8px 0 14px',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: isActive ? 'var(--accent-dark)' : 'var(--fg-muted)',
              fontSize: 9.5,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span style={{ position: 'relative' }}>
              <Icon name={item.icon} size={18} />
              {item.id === 'alertes' && alertCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -5,
                    background: 'var(--danger)',
                    color: '#fff',
                    fontSize: 8,
                    fontWeight: 800,
                    padding: '1px 4px',
                    borderRadius: 8,
                    minWidth: 13,
                    textAlign: 'center',
                  }}
                >
                  {alertCount}
                </span>
              )}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
