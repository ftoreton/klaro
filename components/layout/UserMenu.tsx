'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';

// Menu utilisateur déclenché par l'avatar dans la Topbar.
// Réutilise le POST vers /auth/sign-out (déjà en place pour la Sidebar).
export default function UserMenu({ initial = 'M' }: { initial?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className="av"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu utilisateur"
        onClick={() => setOpen((v) => !v)}
      >
        {initial}
      </button>

      {open && (
        <div className="user-menu-pop" role="menu">
          <Link
            href="/parametres"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Settings size={14} />
            <span>Paramètres</span>
          </Link>

          <form action="/auth/sign-out" method="post" className="user-menu-form">
            <button type="submit" className="user-menu-item" role="menuitem">
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
