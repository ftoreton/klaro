'use client';

import { Check } from 'lucide-react';
import type { SousTache, TermeTechnique } from '@/lib/metier/types';
import AnnotatedText from './AnnotatedText';

interface Props {
  sousTache: SousTache;
  termes: TermeTechnique[];
  onToggle: () => void;
}

export default function SousTacheItem({ sousTache, termes, onToggle }: Props) {
  return (
    <li className={`mt-st-item${sousTache.done ? ' is-done' : ''} niveau-${sousTache.niveau}`}>
      <button
        type="button"
        className="mt-st-check"
        aria-checked={sousTache.done}
        role="checkbox"
        onClick={onToggle}
      >
        {sousTache.done && <Check size={14} strokeWidth={3} />}
      </button>
      <AnnotatedText
        as="span"
        className="mt-st-label"
        text={sousTache.label}
        termes={termes}
      />
      {sousTache.niveau !== 'debutant' && (
        <span className={`mt-st-niveau niveau-${sousTache.niveau}`}>
          {sousTache.niveau === 'expert' ? 'Expert' : 'Intermédiaire'}
        </span>
      )}
    </li>
  );
}
