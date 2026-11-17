// Gantt, spreadsheet, IDE, event calendar, status page, diagram editor and agent builder: what
// is said in words where a colour, a hover or a title used to be the only cue.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')
const PHONE = { width: 390, height: 800 }

test('gantt: Alt with the arrows moves the start alone, and the change is announced', async ({
  page,
}) => {
  await open(page, 'blocks-gantt--roadmap')
  const bar = page.getByRole('button', { name: /^Write the spec, Oct 5, 2026 to Oct 16, 2026/ })
  await expect(bar).toHaveAccessibleDescription(/with Alt, they move its start/)
  await bar.focus()
  await page.keyboard.press('Alt+ArrowRight')
  await expect(
    page.getByRole('button', { name: /^Write the spec, Oct 6, 2026 to Oct 16, 2026/ }),
  ).toBeFocused()
  await expect(page.locator('[data-slot=gantt] [aria-live=polite]')).toHaveText(
    'Write the spec, Oct 6, 2026 to Oct 16, 2026',
  )
  await page.keyboard.press('Alt+ArrowLeft')
  await expect(
    page.getByRole('button', { name: /^Write the spec, Oct 5, 2026 to Oct 16, 2026/ }),
  ).toBeFocused()
})

test('gantt: a late dependency is in the task’s name and its arrow is dashed', async ({ page }) => {
  await open(page, 'blocks-gantt--late-dependency')
  await expect(page.getByRole('button', { name: /^QA and fixes, / })).toHaveAccessibleName(
    /after Billing API, Checkout screens, starts before Checkout screens ends$/,
  )
  await expect(page.locator('[data-slot=gantt] path[data-late]')).toHaveAttribute(
    'stroke-dasharray',
    /\d/,
  )
  // A task that starts on time says nothing more.
  await expect(page.getByRole('button', { name: /^Billing API, / })).toHaveAccessibleName(
    /after Kick-off$/,
  )
})

test('spreadsheet: the help read with the grid says how Tab leaves it', async ({ page }) => {
  await open(page, 'blocks-spreadsheet--default')
  await expect(page.getByRole('grid')).toHaveAccessibleDescription(
    /Tab moves along the row and leaves the grid at either end\.$/,
  )
})

test('ide: a tab says how many errors its file has, and which key closes it', async ({ page }) => {
  await open(page, 'blocks-developer-ide--with-problems')
  const tabs = page
    .getByRole('region', { name: 'Code editor' })
    .getByRole('tablist', { name: 'Open files' })
  const tab = tabs.getByRole('tab', { name: /^format\.ts/ })
  await expect(tab).toHaveAccessibleName('format.ts, 1 error, 0 warnings')
  await expect(tab).toHaveAttribute('aria-keyshortcuts', 'Delete')
  await tab.focus()
  await page.keyboard.press('Delete')
  await expect(tabs.getByRole('tab')).toHaveCount(0)
})

test('event calendar: the expanded day collapses by name; a new month is announced', async ({
  page,
}) => {
  await open(page, 'blocks-workspace--calendar')
  await page.getByRole('button', { name: '1 more' }).click()
  const less = page.getByRole('button', { name: 'Show less' })
  await expect(less).toHaveAttribute('aria-expanded', 'true')
  await less.click()
  await expect(page.getByRole('button', { name: '1 more' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await page.getByRole('button', { name: 'Next month' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'November 2026' })).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'November 2026' })).not.toHaveAttribute(
    'aria-live',
  )
})

test('event calendar: on a phone, today’s card says Today', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await open(page, 'blocks-workspace--calendar')
  const days = page.locator('[data-slot=event-calendar]').getByRole('listitem')
  await expect(days.filter({ hasText: 'Wednesday 14 October' })).toContainText('Today')
  await expect(days.filter({ hasText: 'Friday 16 October' })).not.toContainText('Today')
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0)
})

test('status page: on a phone, the uptime slider counts the 30 days shown', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await open(page, 'blocks-status-page--default')
  const api = page.getByRole('slider', { name: /^API: / })
  await expect(api).toHaveAttribute('aria-valuemax', '30')
  await api.focus()
  await expect(api).toHaveAttribute('aria-valuenow', '30')
  await page.keyboard.press('Home')
  await expect(api).toHaveAttribute('aria-valuenow', '1')
  await expect(api).toHaveAttribute('aria-valuetext', /^Sep 15, 2026: /)
  await page.keyboard.press('ArrowLeft')
  await expect(api).toHaveAttribute('aria-valuetext', /^Sep 15, 2026: /)
})

test('diagram editor: each problem starts with its severity', async ({ page }) => {
  await open(page, 'blocks-diagrams-diagram-editor--with-problems')
  await expect(page.getByText('Error · Line 4 · This line wasn’t understood.')).toBeVisible()
})

test('agent builder: a tool parameter’s description is the field’s description', async ({
  page,
}) => {
  await open(page, 'blocks-ai-agent-builder--agent-selected')
  const params = page
    .getByRole('complementary', { name: 'Node settings' })
    .getByRole('group', { name: 'Tool parameters' })
  await expect(params.getByRole('textbox', { name: /^query/ })).toHaveAccessibleDescription(
    'What to search for',
  )
  await expect(params.getByText('How many results')).toBeVisible()
})
