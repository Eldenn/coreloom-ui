// Unit tests (unit/*.test.ts): the pure functions behind the inputs — parsing what people type,
// formatting what they read. Milliseconds per case, so they cover the edge cases the browser tests
// (tests/, Playwright) only sample. Run: pnpm test:unit
import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    include: ['unit/**/*.test.ts'],
    environment: 'node',
    // Same zone as the browser tests, so dates read the same everywhere.
    env: { TZ: 'Europe/Paris' },
    // `pnpm coverage`: LCOV in coverage/ for crapper (CRAP per function) and any editor plugin.
    // Components are covered by Playwright, not here: read the scores of pure functions.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['text-summary', 'lcov'],
    },
  },
})
