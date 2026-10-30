// axe on every story, in both themes. Fails on any WCAG 2.0–2.2 A / AA or best-practice violation.
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { THEMES, openStory, stories, type Accent, type Locale } from "./stories"

// Both themes in English; French, Spanish and German (translated labels must stay accessible); and two
// accent presets, the ones with the tightest contrasts, so a preset can't break a pairing.
const RUNS: { theme: (typeof THEMES)[number]; locale: Locale; accent?: Accent }[] = [
  ...THEMES.map((theme) => ({ theme, locale: "en" as const })),
  { theme: "dark", locale: "fr" },
  { theme: "light", locale: "es", accent: "rose" },
  { theme: "dark", locale: "de", accent: "violet" },
]

for (const story of stories()) {
  for (const { theme, locale, accent } of RUNS) {
    test(`a11y · ${story.title} · ${story.name} · ${theme}${locale !== "en" ? ` · ${locale}` : ""}${accent ? ` · ${accent}` : ""}`, async ({ page }) => {
      await openStory(page, story.id, theme, locale, accent)
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
