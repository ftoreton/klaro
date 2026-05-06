'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  term: string;
  definition: string;
}

export default function TermePopover({ term, definition }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <span className="mt-term-wrap" ref={wrapRef}>
      <button
        type="button"
        className="mt-term"
        aria-expanded={open}
        aria-describedby={open ? `term-${term}` : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {term}
      </button>
      {open && (
        <span className="mt-term-popover" role="tooltip" id={`term-${term}`}>
          <strong className="mt-term-popover-title">{term}</strong>
          <span className="mt-term-popover-def">{definition}</span>
        </span>
      )}
    </span>
  );
}
