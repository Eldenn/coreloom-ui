import fs from "node:fs"
import path from "node:path"
import type { Page } from "@playwright/test"

export const THEMES = ["dark", "light"] as const
export type Theme = (typeof THEMES)[number]

type Entry = { id: string; type: string; title: string; name: string; tags?: string[] }

/** Every story in the Storybook build (docs pages excluded). Stories tagged `no-test` are skipped. */
export function stories(): Entry[] {
  const file = path.resolve("public/storybook/index.json")
  if (!fs.existsSync(file)) throw new Error("No Storybook build: run pnpm storybook:build first.")
  const index = JSON.parse(fs.readFileSync(file, "utf8")) as { entries: Record<string, Entry> }
  return Object.values(index.entries).filter((e) => e.type === "story" && !e.tags?.includes("no-test"))
}

/** Opens one story in the bare iframe, with a fixed clock, no outside network, fonts loaded. */
export async function openStory(page: Page, id: string, theme: Theme) {
  // Calendars mark "today" and tables show dates: freeze time so screenshots don't change daily.
  await page.clock.setFixedTime(new Date("2026-10-14T10:00:00+02:00"))
  // Only the local Storybook loads; anything remote (avatars, embeds) falls back.
  await page.route(/^(?!http:\/\/127\.0\.0\.1)/, (route) => route.abort())
  // a11y.manual stops Storybook's own a11y addon from running axe in the page (two runs collide).
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};a11y.manual:!true`)
  await page.locator("#storybook-root").waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState("networkidle")
  // Stories that submit a form on mount: wait for the submission to settle.
  await page.waitForFunction(() => !document.querySelector("#storybook-root [data-submitting]"), null, { timeout: 5000 })
}
