// The artifact panel: the card opens and closes it with focus where the reader expects, versions step
// back and forth, Restore adds a version, Changes shows the diff with folded lines, Download saves the
// file, and on a phone the panel covers the chat.
import fs from 'node:fs'

import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, `blocks-ai-artifact--${id}`, 'dark', locale)

test.describe('AI artifact', () => {
  test('Close hides the panel and gives focus back to the card; the card opens it again', async ({
    page,
  }) => {
    await open(page, 'with-chat')
    const panel = page.getByRole('region', { name: 'Release notes — 0.9' })
    const card = page.getByRole('button', { name: /Release notes — 0\.9/ })
    await expect(panel).toBeVisible()
    await expect(card).toHaveAttribute('aria-expanded', 'true')

    await panel.getByRole('button', { name: 'Close panel' }).click()
    await expect(panel).toBeHidden()
    await expect(card).toHaveAttribute('aria-expanded', 'false')
    await expect(card).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(panel).toBeVisible()
    await expect(page.locator('[data-slot="artifact-layout-panel"]')).toBeFocused()
  })

  test('the version arrows step through versions; an older one offers Show latest', async ({
    page,
  }) => {
    await open(page, 'document')
    const versions = page.getByRole('group', { name: 'Versions' })
    await expect(versions).toContainText('Version 3 of 3')
    await expect(versions.getByRole('button', { name: 'Next version' })).toBeDisabled()

    await versions.getByRole('button', { name: 'Previous version' }).click()
    await expect(versions).toContainText('Version 2 of 3')
    await expect(page.getByText('You’re viewing version 2 of 3.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Upgrading' })).toBeHidden()

    await page.getByRole('button', { name: 'Show latest' }).click()
    await expect(versions).toContainText('Version 3 of 3')
    await expect(page.getByRole('heading', { name: 'Upgrading' })).toBeVisible()
  })

  test('Restore adds the older text back as the latest version', async ({ page }) => {
    await open(page, 'with-chat')
    const panel = page.getByRole('region', { name: 'Release notes — 0.9' })
    await panel.getByRole('button', { name: 'Previous version' }).click()
    await panel.getByRole('button', { name: 'Previous version' }).click()
    await expect(panel.getByRole('group', { name: 'Versions' })).toContainText('Version 1 of 3')
    await panel.getByRole('button', { name: 'Restore this version' }).click()
    // Uncontrolled, the panel follows the latest version: the restored one.
    await expect(panel.getByRole('group', { name: 'Versions' })).toContainText('Version 4 of 4')
    await expect(panel.getByText('This release adds a review step to the editor.')).toBeVisible()
    await expect(page.getByRole('button', { name: /Release notes — 0\.9/ })).toContainText('v4')
  })

  test('Changes lists added and removed lines, in words for screen readers', async ({ page }) => {
    await open(page, 'code-changes')
    await expect(page.getByRole('tab', { name: 'Changes' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Compared with v1')).toBeVisible()
    await expect(page.getByText(/^\d+ lines added$/)).toBeVisible()
    const added = page.locator('tr[data-change="add"]')
    const removed = page.locator('tr[data-change="remove"]')
    await expect(added.first()).toContainText('Added')
    await expect(removed.first()).toContainText('Removed')
    await expect(
      added.filter({ hasText: 'export function useDebounce<T>(value: T, delay = 300)' }),
    ).toHaveCount(1)
    await expect(
      removed.filter({ hasText: 'export function useDebounce<T>(value: T, delay: number)' }),
    ).toHaveCount(1)

    await page.getByRole('tab', { name: 'Code' }).click()
    await expect(page.locator('[data-slot="artifact-source"]')).toContainText('if (delay <= 0) {')
  })

  test('long unchanged runs fold, and a click shows them', async ({ page }) => {
    await open(page, 'long-changes')
    await expect(page.getByText('1 line added')).toBeVisible()
    await expect(page.getByText('Step 1: check item 1', { exact: true })).toBeHidden()
    await page.getByRole('button', { name: 'Show 11 unchanged lines' }).click()
    await expect(page.getByText('Step 1: check item 1', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show 12 unchanged lines' })).toBeVisible()
  })

  test('the first version has nothing to compare', async ({ page }) => {
    await open(page, 'first-version')
    await expect(page.getByRole('group', { name: 'Versions' })).toBeHidden()
    await expect(
      page.getByText('This is the first version, so there’s nothing to compare yet.'),
    ).toBeVisible()
  })

  test('Download saves the version shown under its file name', async ({ page }) => {
    await open(page, 'code-changes')
    const downloading = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download' }).click()
    const file = await downloading
    expect(file.suggestedFilename()).toBe('use-debounce.ts')
    const text = fs.readFileSync(await file.path(), 'utf8')
    expect(text).toContain('export function useDebounce<T>(value: T, delay = 300)')
  })

  test('on a phone the panel covers the chat, which comes back on Close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page, 'with-chat')
    const panel = page.getByRole('region', { name: 'Release notes — 0.9' })
    await expect(panel).toBeVisible()
    await expect(page.locator('[data-slot="artifact-layout"]')).toHaveAttribute(
      'data-stacked',
      'true',
    )
    // The chat behind is inert: its composer can't be reached.
    const composer = page.getByRole('textbox', { name: 'Message' })
    expect(await composer.evaluate((el) => el.closest('[inert]') !== null)).toBe(true)
    await panel.getByRole('button', { name: 'Close panel' }).click()
    await expect(panel).toBeHidden()
    expect(await composer.evaluate((el) => el.closest('[inert]') !== null)).toBe(false)
    await expect(page.getByRole('button', { name: /Release notes — 0\.9/ })).toBeFocused()
  })

  test('French labels', async ({ page }) => {
    await open(page, 'french', 'fr')
    await expect(page.getByRole('tab', { name: 'Modifications' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('group', { name: 'Versions' })).toContainText('Version 3 sur 3')
    await expect(page.getByText('Comparée à la v2')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Télécharger' })).toBeVisible()
  })
})
