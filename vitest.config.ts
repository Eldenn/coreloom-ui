// Unit tests (unit/*.test.ts): the pure functions behind the inputs — parsing what people type,
// formatting what they read. Milliseconds per case, so they cover the edge cases the browser tests
// (tests/, Playwright) only sample. Run: pnpm test:unit
import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    include: ["unit/**/*.test.ts"],
    environment: "node",
    // Same zone as the browser tests, so dates read the same everywhere.
    env: { TZ: "Europe/Paris" },
  },
})
