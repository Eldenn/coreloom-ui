// A screenshot of every story, in both themes, compared with tests/__screenshots__; blocks (whole
// screens) are also taken at phone width, where their layouts change most.
// Baselines come from CI's Playwright container: run the "Visual baselines" workflow (or, inside
// that container, pnpm test:update) after an intended visual change, and review the PNG diff.
import fs from "node:fs"
import path from "node:path"
import { expect, test } from "@playwright/test"

import { THEMES, openStory, stories } from "./stories"

const baselines = path.resolve("tests/__screenshots__")
/** A common phone (iPhone 15 / Pixel 8 class) in CSS pixels. */
const PHONE = { width: 390, height: 844 }

for (const story of stories()) {
  const sizes = story.title.startsWith("Blocks/") ? (["desktop", "phone"] as const) : (["desktop"] as const)
  for (const theme of THEMES) {
    for (const size of sizes) {
      const suffix = size === "phone" ? "--phone" : ""
      test(`visual · ${story.title} · ${story.name} · ${theme}${size === "phone" ? " · phone" : ""}`, async ({ page }) => {
        const updating = ["all", "changed"].includes(test.info().config.updateSnapshots)
        test.skip(!updating && !fs.existsSync(baselines), "No baselines yet: run the Visual baselines workflow once.")
        if (size === "phone") await page.setViewportSize(PHONE)
        await openStory(page, story.id, theme)
        await expect(page).toHaveScreenshot(`${story.id}--${theme}${suffix}.png`, { fullPage: true })
      })
    }
  }
}
