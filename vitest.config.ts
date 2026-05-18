import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Vitest config minimale : on n'utilise pas le runner DOM (les tests sont
// purement unitaires sur des fonctions). Le seul setup nécessaire est
// l'alias `@/*` cohérent avec tsconfig.json.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
