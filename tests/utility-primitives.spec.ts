// Toolbar, action bar, popconfirm, secret value, number formats, notification badge, overflow list,
// file card, keyboard shortcuts, countdown and quota bar: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { allowClipboard, openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('toolbar: one Tab stop, arrow keys move, toggles press, More opens a menu', async ({
  page,
}) => {
  await open(page, 'components-actions-toolbar--default')
  const toolbar = page.getByRole('toolbar', { name: 'Formatting' })
  const bold = toolbar.getByRole('button', { name: 'Bold' })
  await expect(bold).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Tab')
  await expect(bold).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(toolbar.getByRole('button', { name: 'Italic' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(toolbar.getByRole('button', { name: 'Italic' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.keyboard.press('End')
  const more = toolbar.getByRole('button', { name: 'More' })
  await expect(more).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menuitem', { name: 'Numbered list' })).toBeVisible()
})

test('action bar: counts the selection, Escape clears it', async ({ page }) => {
  await open(page, 'components-actions-action-bar--default', 'fr')
  const bar = page.getByRole('group', { name: 'Actions groupées' })
  await expect(bar).toContainText('3 sélectionnés')
  await page.getByRole('checkbox').nth(3).check()
  await expect(bar).toContainText('4 sélectionnés')
  await bar.getByRole('button', { name: /Archive/ }).focus()
  await page.keyboard.press('Escape')
  await expect(bar).toHaveCount(0)
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0)
})

test('popconfirm: Cancel is focused, an async confirm waits then closes', async ({ page }) => {
  await open(page, 'components-overlays-popconfirm--default')
  const dialog = page.getByRole('alertdialog', { name: 'Delete this comment?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Delete' }).click()
  await expect(dialog.getByRole('button', { name: 'Delete' })).toHaveAttribute('aria-busy', 'true')
  await page.clock.runFor(1300)
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})

test('secret value: masked until shown, Show is a toggle', async ({ page }) => {
  await open(page, 'components-data-display-secret-value--default')
  await allowClipboard(page)
  const secret = page.locator('[data-slot=secret-value]').first()
  await expect(secret.locator('code')).toContainText('cl_live_••••••••••••c9f2')
  await expect(secret.locator('code')).not.toContainText('51Hc9')
  const show = secret.getByRole('button', { name: 'Show API key' })
  await show.click()
  await expect(show).toHaveAttribute('aria-pressed', 'true')
  await expect(secret.locator('code')).toHaveText('cl_live_demo0000example0000c9f2')
  await secret.getByRole('button', { name: 'Copy API key' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'cl_live_demo0000example0000c9f2',
  )
})

test('format number: French writes French numbers; animated numbers end on the value', async ({
  page,
}) => {
  await open(page, 'components-data-display-format-number--default', 'fr')
  const values = page.locator('[data-slot=format-number]')
  await expect(values.nth(4)).toHaveText(/^1\s?290,50\s?€$/)
  await expect(values.nth(2)).toHaveText(/^12,8\s?%$/)
  await open(page, 'components-data-display-format-number--animated')
  await expect(page.locator('[data-slot=animated-number]').first()).toContainText('€48,210')
})

test('notification badge: caps at 99+, says the count in words', async ({ page }) => {
  await open(page, 'components-data-display-notification-badge--default')
  await expect(page.getByRole('button', { name: 'Notifications 3 unread' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Inbox 128 unread' })).toContainText('99+')
  await expect(page.getByRole('button', { name: 'Messages New' })).toBeVisible()
})

test('overflow list: shows what fits, +N opens the rest', async ({ page }) => {
  await open(page, 'components-data-display-overflow-list--default')
  const rows = page.locator('[data-slot=overflow-list][aria-label=Labels]')
  const wide = await rows.nth(0).locator(':scope > [data-slot=badge]').count()
  const narrow = await rows.nth(2).locator(':scope > [data-slot=badge]').count()
  expect(wide).toBeGreaterThan(narrow)
  const more = rows.nth(2).getByRole('button', { name: /^Show \d+ more$/ })
  await expect(more).toHaveText(`+${9 - narrow}`)
  await more.click()
  await expect(page.locator('[data-slot=overflow-list-popover] [data-slot=badge]')).toHaveCount(
    9 - narrow,
  )
  // max caps the avatars at 5.
  await expect(page.locator('[aria-label=Members] > [data-slot=avatar]')).toHaveCount(5)
})

test('file card: progress, error with Retry, the extension stays visible', async ({ page }) => {
  await open(page, 'components-data-display-file-card--default')
  await expect(
    page.getByRole('progressbar', { name: 'Uploading customers-2026.csv' }),
  ).toHaveAttribute('aria-valuenow', '64')
  await expect(page.getByRole('button', { name: 'Retry brand assets.zip' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancel the upload of customers-2026.csv' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Q3 report/ })).toContainText('.pdf')
  await expect(page.getByText('482.1\u00a0kB · PDF')).toBeVisible()
})

test('keyboard shortcuts: the dialog filters; hotkeys and sequences fire', async ({ page }) => {
  await open(page, 'components-actions-keyboard-shortcuts--default')
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('searchbox', { name: 'Search shortcuts' }).fill('inbox')
  await expect(dialog.locator('dt')).toHaveText(['Go to the inbox'])
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.keyboard.press('g')
  await page.keyboard.press('i')
  await expect(page.getByText('Last shortcut: g i')).toBeVisible()
  await page.keyboard.press('Control+k')
  await expect(page.getByText('Last shortcut: mod+k')).toBeVisible()
  await page.keyboard.press('Shift+?')
  await expect(dialog).toBeVisible()
})

test('countdown: ticks, speaks in words, and shows the completed state', async ({ page }) => {
  await open(page, 'components-data-display-countdown--default')
  const clock = page.locator('[data-slot=countdown][data-variant=clock]')
  await expect(clock).toContainText('2:05:14:07')
  await expect(clock.locator('.sr-only')).toHaveText('2 days, 5 hours, 14 minutes, 7 seconds')
  await expect(page.locator('[data-slot=countdown][data-variant=text]')).toContainText(
    '14 min 32 s',
  )
  await expect(page.getByText('Live now')).toBeVisible()
  await page.clock.setFixedTime(new Date('2026-10-14T10:00:03+02:00'))
  await page.clock.runFor(3000)
  await expect(clock).toContainText('2:05:14:04')
})

test('quota bar: a meter with the total, amber then red near the limit', async ({ page }) => {
  await open(page, 'components-data-display-quota-bar--levels')
  const meters = page.getByRole('meter')
  await expect(meters.nth(0)).toHaveAttribute('aria-valuetext', '12 of 25, 48%')
  await expect(page.locator('[data-slot=quota-bar][data-level=ok]')).toHaveCount(1)
  await expect(page.locator('[data-slot=quota-bar][data-level=warning]')).toHaveCount(1)
  await expect(page.locator('[data-slot=quota-bar][data-level=danger]')).toHaveCount(1)
})
