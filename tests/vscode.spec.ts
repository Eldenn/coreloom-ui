// The VS Code theme (vscode.css): the components take the colours VS Code sets in a webview, whatever
// Coreloom theme the page is in, and high contrast keeps fills and edges visible. Runs on the
// Foundations/VS Code stories, which carry a copy of each built-in theme's variables.
import { expect, type Page, test } from '@playwright/test'

import { openStory, type Theme } from './stories'

const color = (
  page: Page,
  selector: string,
  property: 'backgroundColor' | 'borderColor' | 'color',
) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el)[p], property)

for (const theme of ['dark', 'light'] as Theme[]) {
  test(`Dark Modern colours win over the Coreloom ${theme} theme`, async ({ page }) => {
    await openStory(page, 'foundations-vs-code--dark-modern', theme)
    const preview = '[data-vscode="dark"]'
    expect(await color(page, preview, 'backgroundColor')).toBe('rgb(31, 31, 31)')
    expect(await color(page, preview, 'color')).toBe('rgb(204, 204, 204)')
    const run = page.getByRole('button', { name: 'Run tests' })
    expect(await run.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgb(0, 120, 212)',
    )
    expect(await run.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)')
  })
}

test('Light Modern uses the editor background and button', async ({ page }) => {
  await openStory(page, 'foundations-vs-code--light-modern', 'dark')
  expect(await color(page, '[data-vscode="light"]', 'backgroundColor')).toBe('rgb(255, 255, 255)')
  const run = page.getByRole('button', { name: 'Run tests' })
  expect(await run.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(0, 95, 184)')
})

test('high contrast draws edges with the contrast border and fills with the active border', async ({
  page,
}) => {
  await openStory(page, 'foundations-vs-code--high-contrast', 'dark')
  const checkbox = page.getByRole('checkbox', { name: 'Collect coverage' })
  expect(await checkbox.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    'rgb(243, 133, 24)',
  )
  expect(await color(page, '[data-vscode="high-contrast"] [data-slot="card"]', 'borderColor')).toBe(
    'rgb(111, 195, 223)',
  )
})

test('menus open from the preview and the keyboard closes them', async ({ page }) => {
  await openStory(page, 'foundations-vs-code--dark-modern', 'dark')
  const more = page.getByRole('button', { name: 'More actions' })
  await more.click()
  await expect(page.getByRole('menuitem', { name: 'Refresh' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(more).toBeFocused()
})
