'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import type { ScenarioKey } from '@/lib/types';
import scenarios from '@/lib/scenarios';

interface ScenarioPanelProps {
  current: ScenarioKey;
  onChange: (key: ScenarioKey) => void;
  onReset: () => void;
}

const SCENARIO_KEYS: ScenarioKey[] = ['demarrage', 'enCours', 'crise'];

export default function ScenarioPanel({ current, onChange, onReset }: ScenarioPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="scenario-fab">
      {open && (
        <div className="scenario-panel">
          <div className="sp-title">Scénario chantier</div>
          {SCENARIO_KEYS.map((key) => {
            const sc = scenarios[key];
            return (
              <div
                key={key}
                className={`scenario-option ${current === key ? 'active' : ''}`}
                onClick={() => { onChange(key); setOpen(false); }}
              >
                <div className="so-dot" />
                <div>
                  <div className="so-label">{sc.label}</div>
                  <div className="so-sub">{sc.sub}</div>
                </div>
              </div>
            );
          })}
          <button className="sp-reset" onClick={() => { onReset(); setOpen(false); }}>
            Réinitialiser le chantier
          </button>
        </div>
      )}

      <button className="scenario-fab-btn" onClick={() => setOpen((v) => !v)}>
        <Icon name="settings" size={14} />
        {open ? 'Fermer' : 'Scénario'}
      </button>
    </div>
  );
}
