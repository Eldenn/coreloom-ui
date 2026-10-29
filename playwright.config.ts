// Tests run against the built Storybook (pnpm storybook:build → public/storybook):
//   tests/a11y.spec.ts    axe on every story, dark and light
//   tests/visual.spec.ts  a screenshot of every story, dark and light, compared with tests/__screenshots__
// Screenshots depend on the OS's font rendering, so baselines come from CI's Playwright container
// (the "Visual baselines" workflow), never from a laptop. The version here must match that image.
import { defineConfig, devices } from "@playwright/test"

const PORT = 6106

export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate: "tests/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.002 },
  },
  webServer: {
    command: `node tests/serve.mjs public/storybook ${PORT}`,
    url: `http://127.0.0.1:${PORT}/index.json`,
    reuseExistingServer: !process.env.CI,
  },
})
