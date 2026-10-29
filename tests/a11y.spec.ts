// axe on every story, in both themes. Fails on any WCAG 2.0–2.2 A / AA or best-practice violation.
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { THEMES, openStory, stories } from "./stories"

// Both themes in English, plus French in dark: translated labels must stay accessible too.
const RUNS = [...THEMES.map((theme) => ({ theme, locale: "en" as const })), { theme: "dark" as const, locale: "fr" as const }]

for (const story of stories()) {
  for (const { theme, locale } of RUNS) {
    test(`a11y · ${story.title} · ${story.name} · ${theme}${locale === "fr" ? " · fr" : ""}`, async ({ page }) => {
      await openStory(page, story.id, theme, locale)
      const { violations } = await new AxeBuilder({ page })
        .include("#storybook-root")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        // A story is a fragment of a page: page-level landmark and heading rules don't apply.
        .disableRules(["region", "landmark-one-main", "page-has-heading-one"])
        .analyze()
      const report = violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.map((n) => `  ${n.target.join(" ")}\n    ${n.failureSummary?.split("\n").slice(1).join(" ")}`).join("\n")}`)
      expect(report, report.join("\n\n")).toEqual([])
    })
  }
}
