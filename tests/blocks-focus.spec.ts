// Blocks whose controls remove themselves (a revoked key, a closed pane, a cleared filter): after
// the keyboard activates one, focus lands on a named neighbour, never on <body>.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

const focusedTag = (page: Page) => page.evaluate(() => document.activeElement?.tagName)

test('api keys: revoking a key moves focus to the next key, the previous one, then the card', async ({
  page,
}) => {
  await open(page, 'blocks-developer-settings--api-keys-list')
  const revoke = async (name: string) => {
    await page.getByRole('button', { name: `Revoke ${name}`, exact: true }).press('Enter')
    await page.getByRole('alertdialog').getByRole('button', { name: 'Revoke key' }).press('Enter')
    await expect(page.locator('[data-slot=api-key]').filter({ hasText: name })).toHaveCount(0)
  }
  await revoke('GitHub Actions')
  await expect(page.getByRole('button', { name: 'Revoke Local testing' })).toBeFocused()
  await revoke('Local testing')
  await expect(page.getByRole('button', { name: 'Revoke Production server' })).toBeFocused()
  await revoke('Production server')
  await expect(page.getByText('No API keys yet', { exact: false })).toBeVisible()
  await expect(page.locator('[data-slot=card-content]')).toBeFocused()
})

test('sessions: signing a device out moves focus to the next device, then the list', async ({
  page,
}) => {
  await open(page, 'blocks-security--sessions')
  const others = page.getByRole('button', { name: /^Sign out of .+ on / })
  await expect(others).toHaveCount(2)
  await others.first().press('Enter')
  await expect(others).toHaveCount(1)
  await expect(others).toBeFocused()
  await others.press('Enter')
  await expect(others).toHaveCount(0)
  await expect.poll(() => focusedTag(page)).toBe('UL')
})

test('knowledge base: focus returns to the row’s menu on Cancel, to the next row on Remove', async ({
  page,
}) => {
  await open(page, 'blocks-ai-workspace--knowledge')
  const actions = page.getByRole('button', { name: 'Actions for Runbook — rollbacks.pdf' })
  const dialog = page.getByRole('alertdialog')

  await actions.press('Enter')
  await page.getByRole('menuitem', { name: 'Remove' }).press('Enter')
  await dialog.getByRole('button', { name: 'Cancel' }).press('Enter')
  await expect(dialog).toBeHidden()
  await expect(actions).toBeFocused()

  await actions.press('Enter')
  await page.getByRole('menuitem', { name: 'Remove' }).press('Enter')
  await dialog.getByRole('button', { name: 'Remove' }).press('Enter')
  await expect(dialog).toBeHidden()
  await expect(actions).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Actions for Pricing 2026.docx' })).toBeFocused()
})

test('playground: removing a variant moves focus to its neighbour, then to the last model picker', async ({
  page,
}) => {
  await open(page, 'blocks-ai-workspace--playground-story')
  await page.getByRole('button', { name: 'Add a variant' }).click()
  await expect(page.getByRole('region', { name: /^Variant \d$/ })).toHaveCount(3)
  await page.getByRole('button', { name: 'Remove variant 2' }).press('Enter')
  await expect(page.getByRole('region', { name: /^Variant \d$/ })).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Remove variant 2' })).toBeFocused()
  await page.getByRole('button', { name: 'Remove variant 2' }).press('Enter')
  await expect(page.getByRole('region', { name: /^Variant \d$/ })).toHaveCount(1)
  await expect(page.getByRole('combobox', { name: 'Model' })).toBeFocused()
})

test('terminal console: closing the split pane with its own button focuses the tab that stays', async ({
  page,
}) => {
  await open(page, 'blocks-developer-terminal-console--split')
  await expect(page.getByRole('group', { name: 'pnpm dev' })).toBeVisible()
  await page.getByRole('button', { name: 'Close pnpm dev' }).press('Enter')
  await expect(page.getByRole('group', { name: 'pnpm dev' })).toHaveCount(0)
  await expect(page.getByRole('tab', { name: /^zsh/ })).toBeFocused()
})

test('data list: Clear filters hands focus to the search box, from the toolbar and from the empty state', async ({
  page,
}) => {
  await open(page, 'blocks-data-list--projects')
  const search = page.getByRole('searchbox', { name: 'Search projects…' })
  const toolbar = page.locator('[data-slot=data-list-toolbar]')

  await search.fill('core')
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('core')
  await toolbar.getByRole('button', { name: 'Clear filters' }).press('Enter')
  await expect(toolbar.getByRole('button', { name: 'Clear filters' })).toHaveCount(0)
  await expect(search).toBeFocused()

  await search.fill('no such project')
  const empty = page.locator('[data-slot=empty]')
  await expect(empty).toBeVisible()
  await empty.getByRole('button', { name: 'Clear filters' }).press('Enter')
  await expect(empty).toHaveCount(0)
  await expect(search).toBeFocused()
})

test('faceted filter: its Clear button hands focus to the panel’s search box', async ({ page }) => {
  await open(page, 'blocks-data-list--faceted-filter-alone')
  await page.getByRole('button', { name: 'Filter by Status' }).press('Enter')
  const clear = page.getByRole('button', { name: 'Clear filters' })
  await clear.press('Enter')
  await expect(clear).toHaveCount(0)
  await expect(page.locator('[data-slot=command-input]')).toBeFocused()
})

test('notifications: Mark all as read keeps focus in the panel', async ({ page }) => {
  await open(page, 'blocks-workspace--notifications')
  await page.getByRole('button', { name: 'Notifications, 3 unread' }).press('Enter')
  const panel = page.getByRole('dialog', { name: 'Notifications' })
  await panel.getByRole('button', { name: 'Mark all as read' }).press('Enter')
  await expect(panel.getByRole('button', { name: 'Mark all as read' })).toHaveCount(0)
  await expect(panel).toBeFocused()
})
