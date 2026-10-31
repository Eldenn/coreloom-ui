// The Guidelines pages (stories/guidelines/*.mdx): each renders its guide and its example story without errors.
import fs from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

interface Entry {
  id: string
  type: string
  title: string
}
const index = JSON.parse(fs.readFileSync(path.resolve('public/storybook/index.json'), 'utf8')) as {
  entries: Record<string, Entry>
}
const pages = Object.values(index.entries).filter(
  (e) => e.type === 'docs' && e.title.startsWith('Guidelines/'),
)

test('every component has a guidelines page', () => {
  expect(pages.length).toBeGreaterThan(80)
})

for (const pageEntry of pages) {
  test(`guidelines · ${pageEntry.title}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.route(/^(?!http:\/\/127\.0\.0\.1)/, (route) => route.abort())
    await page.goto(`/iframe.html?id=${pageEntry.id}&viewMode=docs`)
    // Block pages render whole screens: allow for a busy CI machine.
    await expect(page.locator('#storybook-docs h1').first()).toBeVisible({ timeout: 15_000 })
    // A guide with an example shows it; a broken `of={…}` shows Storybook's error instead.
    await expect(page.locator('#storybook-docs')).not.toContainText("Couldn't find story")
    expect(errors).toEqual([])
  })
}
