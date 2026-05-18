import { describe, expect, it } from 'vitest';
import { loadTrade } from './loader';

describe('loadTrade — déduplication des phases multi-sources', () => {
  it('revetements (sol + peinture) : phase ids uniques après merge', () => {
    const loaded = loadTrade('revetements');
    const ids = loaded.phases.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('revetements : la phase "preparation" mergée contient des tâches des deux sources', () => {
    const loaded = loadTrade('revetements');
    const prep = loaded.phases.find((p) => p.id === 'preparation');
    expect(prep).toBeDefined();
    // sol-v3 a 3 tâches en "preparation", peinture-v3 en a aussi.
    // Après merge on doit avoir des tâches des deux côtés (ids préfixés rev_/pein_).
    const taskIdPrefixes = new Set(prep!.tasks.map((t) => t.id.split('_')[0]));
    expect(taskIdPrefixes.size).toBeGreaterThan(1);
  });

  it('plomberie (plomberie + chauffage) : aucun id dupliqué', () => {
    const loaded = loadTrade('plomberie');
    const ids = loaded.phases.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
