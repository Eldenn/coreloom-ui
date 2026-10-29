// A screenshot of every story, in both themes, compared with tests/__screenshots__.
// Baselines come from CI's Playwright container: run the "Visual baselines" workflow (or, inside
// that container, pnpm test:update) after an intended visual change, and review the PNG diff.
import fs from "node:fs"
import path from "node:path"
import { expect, test } from "@playwright/test"

import { THEMES, openStory, stories } from "./stories"

const baselines = path.resolve("tests/__screenshots__")

for (const story of stories()) {
  for (const theme of THEMES) {
    test(`visual · ${story.title} · ${story.name} · ${theme}`, async ({ page }) => {
      const updating = ["all", "changed"].includes(test.info().config.updateSnapshots)
      test.skip(!updating && !fs.existsSync(baselines), "No baselines yet: run the Visual baselines workflow once.")
      await openStory(page, story.id, theme)
      await expect(page).toHaveScreenshot(`${story.id}--${theme}.png`, { fullPage: true })
    })
  }
}
