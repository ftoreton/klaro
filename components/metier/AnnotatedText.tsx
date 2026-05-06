'use client';

import { Fragment } from 'react';
import { useTokens } from '@/lib/metier/glossary';
import type { TermeTechnique } from '@/lib/metier/types';
import TermePopover from './TermePopover';

interface Props {
  text: string;
  termes: TermeTechnique[];
  as?: 'span' | 'p' | 'div';
  className?: string;
}

export default function AnnotatedText({ text, termes, as = 'span', className }: Props) {
  const tokens = useTokens(text, termes);
  const Tag = as as 'span';

  return (
    <Tag className={className}>
      {tokens.map((tk, i) => {
        if (tk.type === 'text') {
          return <Fragment key={i}>{tk.value}</Fragment>;
        }
        return <TermePopover key={i} term={tk.value} definition={tk.definition} />;
      })}
    </Tag>
  );
}
