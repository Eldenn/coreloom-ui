// The theme generator page (Foundations/Theme generator): typing a colour rebuilds the accent,
// the preview uses it in both themes, and brand.css is there to copy or download.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')
const STORY = 'foundations-theme-generator--'

test.describe('theme generator', () => {
  test('a typed colour rebuilds the preview, the checks and brand.css', async ({ page }) => {
    await open(page, `${STORY}generator`)
    const status = page.getByRole('status')
    await expect(status).toHaveText('All 10 contrast checks pass for #ff5a1f.')

    const hex = page.getByRole('textbox', { name: 'Brand colour', exact: true })
    await hex.fill('#7c3aed')
    await expect(status).toHaveText('All 10 contrast checks pass for #7c3aed.')
    // A light-theme violet: kept as it is in light, so the light preview fills with it.
    // (toHaveCSS waits: the button eases from the old colour to the new one.)
    const deploy = (theme: string) =>
      page
        .getByRole('region', { name: `${theme} theme preview` })
        .getByRole('button', { name: 'Deploy' })
    await expect(deploy('Light')).toHaveCSS('background-color', 'rgb(124, 58, 237)')
    // The dark preview gets its own, lighter fill (#a384ff).
    await expect(deploy('Dark')).toHaveCSS('background-color', 'rgb(163, 132, 255)')

    const css = page.getByRole('region', { name: 'brand.css source' })
    await expect(css).toContainText("[data-accent='orange'] {")
    await expect(css).toContainText('--accent: #7c3aed;')
    await expect(page.getByRole('table')).toContainText('Pass')
    await expect(page.getByRole('table')).not.toContainText('Fail')
  })

  test('the name becomes a safe data-accent value', async ({ page }) => {
    await open(page, `${STORY}generator`)
    const name = page.getByRole('textbox', { name: 'Name', exact: true })
    await name.fill('Acme Orange!')
    await expect(name).toHaveAccessibleDescription('Used as data-accent="acme-orange"')
    await expect(page.getByRole('region', { name: 'brand.css source' })).toContainText(
      "[data-theme='light'] [data-accent='acme-orange'] {",
    )
  })

  test('a half-typed colour is flagged and the preview keeps the last valid one', async ({
    page,
  }) => {
    await open(page, `${STORY}generator`)
    const hex = page.getByRole('textbox', { name: 'Brand colour', exact: true })
    await hex.fill('#ff5a')
    await expect(hex).toHaveAttribute('aria-invalid', 'true')
    await expect(hex).toHaveAccessibleDescription(/Enter a hex colour such as #ff5a1f/)
    await expect(page.getByRole('status')).toHaveText('All 10 contrast checks pass for #ff5a1f.')
    await hex.fill('#ff5a1f')
    await expect(hex).not.toHaveAttribute('aria-invalid', 'true')
  })

  test('the native colour picker and the hex field stay in step', async ({ page }) => {
    await open(page, `${STORY}generator`)
    const picker = page.getByLabel('Pick the brand colour')
    await expect(picker).toHaveValue('#ff5a1f')
    await picker.fill('#00aa55')
    await expect(page.getByRole('textbox', { name: 'Brand colour', exact: true })).toHaveValue(
      '#00aa55',
    )
    await expect(page.getByRole('status')).toContainText('#00aa55')
  })

  test('dark text on the light fill switches the light theme over', async ({ page }) => {
    await open(page, `${STORY}generator`)
    const css = page.getByRole('region', { name: 'brand.css source' })
    await expect(css).toContainText('--fg-on-accent: #ffffff;')
    await page.getByRole('switch', { name: 'Dark text on the light fill' }).click()
    await expect(css).not.toContainText('--fg-on-accent: #ffffff;')
  })

  test('copies brand.css and offers it as a download', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page, `${STORY}generator`)
    await page.getByRole('button', { name: 'Copy' }).click()
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain("[data-accent='orange'] {")
    expect(copied).toBe(await page.getByRole('region', { name: 'brand.css source' }).innerText())

    const download = page.waitForEvent('download')
    await page.getByRole('link', { name: 'Download' }).click()
    expect((await download).suggestedFilename()).toBe('brand.css')
  })
})
