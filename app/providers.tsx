'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { compute } from '@/lib/engine';
import scenarios from '@/lib/scenarios';
import type { AppState, ComputeResult, ScenarioKey } from '@/lib/types';

interface KlaroContext {
  state: AppState;
  result: ComputeResult;
  toast: string | null;
  scenarioKey: ScenarioKey;
  onValidate: (taskId: string) => void;
  onLater: (taskId: string) => void;
  onValidateAlert: (alertId: string) => void;
  onLaterAlert: (alertId: string) => void;
  signDevis: (devisId: string) => void;
  changeScenario: (key: ScenarioKey) => void;
  resetScenario: () => void;
}

const Ctx = createContext<KlaroContext | null>(null);

export function useKlaro() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useKlaro must be used inside KlaroProvider');
  return ctx;
}

function initState(key: ScenarioKey): AppState {
  const sc = scenarios[key];
  return {
    scenario: key,
    project: sc.project,
    tasks: sc.tasks.map((t) => ({ ...t })),
    devis: sc.devis.map((d) => ({ ...d })),
    dismissedAlerts: [],
  };
}

export function KlaroProvider({ children }: { children: React.ReactNode }) {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('enCours');
  const [state, setState] = useState<AppState>(() => initState('enCours'));
  const [toast, setToast] = useState<string | null>(null);

  const fire = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const result = useMemo(() => compute(state), [state]);

  const onValidate = useCallback((taskId: string) => {
    setState((s) => {
      const task = s.tasks.find((t) => t.id === taskId);
      if (task) fire(`✓ ${task.nom} validée`);
      return {
        ...s,
        tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, statut: 'terminé' } : t)),
      };
    });
  }, [fire]);

  const onLater = useCallback((taskId: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, dueIn: t.dueIn + 2 } : t)),
    }));
    fire('Reportée à plus tard');
  }, [fire]);

  const onValidateAlert = useCallback((alertId: string) => {
    if (alertId.startsWith('devis-')) {
      const did = alertId.replace('devis-', '');
      setState((s) => ({
        ...s,
        devis: s.devis.map((d) => (d.id === did ? { ...d, signe: true } : d)),
      }));
      fire('✓ Devis signé');
    } else if (alertId.startsWith('retard-')) {
      const tid = alertId.replace('retard-', '');
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === tid ? { ...t, dueIn: 1 } : t)),
      }));
      fire('Tâche replanifiée');
    } else if (alertId.startsWith('critique-')) {
      const tid = alertId.replace('critique-', '');
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === tid ? { ...t, statut: 'terminé' } : t)),
      }));
      fire('✓ Tâche faite');
    } else if (alertId.startsWith('blocage-')) {
      setState((s) => ({
        ...s,
        dismissedAlerts: [...s.dismissedAlerts, alertId],
      }));
      fire('Vu — on traitera la dépendance');
    }
  }, [fire]);

  const onLaterAlert = useCallback((alertId: string) => {
    setState((s) => ({
      ...s,
      dismissedAlerts: [...s.dismissedAlerts, alertId],
    }));
    fire('Reportée');
  }, [fire]);

  const signDevis = useCallback((devisId: string) => {
    setState((s) => {
      const d = s.devis.find((x) => x.id === devisId);
      if (d) fire(`✓ Devis ${d.metier} signé`);
      return {
        ...s,
        devis: s.devis.map((x) => (x.id === devisId ? { ...x, signe: true } : x)),
      };
    });
  }, [fire]);

  const changeScenario = useCallback((key: ScenarioKey) => {
    setScenarioKey(key);
    setState(initState(key));
  }, []);

  const resetScenario = useCallback(() => {
    setState(initState(scenarioKey));
    fire('Chantier réinitialisé');
  }, [scenarioKey, fire]);

  return (
    <Ctx.Provider
      value={{
        state,
        result,
        toast,
        scenarioKey,
        onValidate,
        onLater,
        onValidateAlert,
        onLaterAlert,
        signDevis,
        changeScenario,
        resetScenario,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
