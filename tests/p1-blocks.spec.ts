// AI evaluations, file manager, inbox and spreadsheet blocks: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

const status = (page: Page, text: string | RegExp) =>
  page.getByRole('status').filter({ hasText: text })

test('evals: a comparison opens on the regressions, filters and selects cases', async ({
  page,
}) => {
  await open(page, 'blocks-ai-evaluations--compare')
  const filters = page.getByRole('radiogroup', { name: 'Show cases' })
  await expect(filters.getByRole('radio', { name: 'Regressions 2' })).toBeChecked()
  const cases = page.getByRole('region', { name: 'Cases' })
  await expect(cases.getByRole('button')).toHaveCount(2)
  await expect(cases.getByRole('button', { name: /Refund after 30 days/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('region', { name: 'Refund after 30 days' })).toContainText(
    'Promises a refund outside the 30-day window',
  )

  await filters.getByText('Improved 2').click()
  await cases.getByRole('button', { name: /Student discount/ }).click()
  const detail = page.getByRole('region', { name: 'Student discount' })
  await expect(detail).toContainText('Now matches the help center.')
  await expect(detail.locator('[data-slot=diff-viewer]')).toBeVisible()
})

test('evals: Run marks the suite busy, then free again', async ({ page }) => {
  await open(page, 'blocks-ai-evaluations--suites')
  const run = page.getByRole('button', { name: 'Run Refusals and safety' })
  await run.click()
  await expect(run).toBeDisabled()
  await expect(run).toBeEnabled({ timeout: 5000 })
  await expect(page.getByRole('list', { name: 'Eval suites' })).toContainText('Never run')
})

test('evals: French', async ({ page }) => {
  await open(page, 'blocks-ai-evaluations--french', 'fr')
  await expect(page.getByRole('radio', { name: 'Régressions 2' })).toBeChecked()
  await expect(page.getByText('Verdict du juge')).toBeVisible()
})

test('file manager: keyboard selection, open a folder and come back up', async ({ page }) => {
  await open(page, 'blocks-file-manager--default')
  const list = page.getByRole('listbox', { name: 'Contents of All files' })
  await expect(list).toHaveAttribute('aria-multiselectable', 'true')
  await list.getByRole('option', { name: /^Contracts/ }).click()
  await expect(list.getByRole('option', { name: /^Contracts/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.keyboard.press('Shift+ArrowRight')
  await page.keyboard.press('Shift+ArrowRight')
  await expect(list.getByRole('option', { selected: true })).toHaveCount(3)
  await expect(status(page, '3 items selected')).toBeAttached()

  await page.keyboard.press('Escape')
  await expect(list.getByRole('option', { selected: true })).toHaveCount(0)

  await list.getByRole('option', { name: /^Design/ }).focus()
  await page.keyboard.press('Enter')
  const design = page.getByRole('listbox', { name: 'Contents of Design' })
  await expect(design.getByRole('option', { name: /Homepage hero\.png/ })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Design')
  await design.getByRole('option').first().focus()
  await page.keyboard.press('Backspace')
  await expect(list).toBeVisible()
})

test('file manager: Move to moves the selection and says so', async ({ page }) => {
  await open(page, 'blocks-file-manager--default')
  // The story opens with Roadmap 2027.md selected.
  await page
    .getByRole('toolbar', { name: 'Selected items' })
    .getByRole('button', { name: 'Move to' })
    .click()
  await page.getByRole('menuitem', { name: 'Reports' }).click()
  await expect(status(page, '1 item moved to Reports')).toBeAttached()
  const list = page.getByRole('listbox', { name: 'Contents of All files' })
  await expect(list.getByRole('option', { name: /Roadmap 2027\.md/ })).toHaveCount(0)
  await expect(list.getByRole('option', { name: /^Reports/ })).toContainText('2 items')
})

test('file manager: a folder can’t move into itself', async ({ page }) => {
  await open(page, 'blocks-file-manager--default')
  await page.getByRole('option', { name: /^Design/ }).click()
  await page.getByRole('button', { name: 'Move to' }).click()
  await expect(page.getByRole('menuitem', { name: 'Design' })).toHaveCount(0)
  await expect(page.getByRole('menuitem', { name: 'All files' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
})

test('file manager: drag a file onto a folder', async ({ page }) => {
  await open(page, 'blocks-file-manager--default')
  const list = page.getByRole('listbox', { name: 'Contents of All files' })
  await list
    .getByRole('option', { name: /customers-export\.csv/ })
    .dragTo(list.getByRole('option', { name: /^Contracts/ }))
  await expect(status(page, '1 item moved to Contracts')).toBeAttached()
  await expect(list.getByRole('option', { name: /customers-export\.csv/ })).toHaveCount(0)
})

test('inbox: opening an unread conversation, then replying with Ctrl+Enter', async ({ page }) => {
  await open(page, 'blocks-inbox--default')
  const list = page.getByRole('list', { name: 'Conversations' })
  const lena = list.getByRole('button', { name: /Lena Fischer/ })
  await expect(lena).toContainText('Unread')
  await lena.click()
  await expect(lena).toHaveAttribute('aria-current', 'true')
  await expect(lena).not.toContainText('Unread')
  const thread = page.getByRole('region', { name: 'Charged twice for October' })
  await expect(thread.getByRole('list', { name: 'Attachments' })).toContainText(
    'bank-statement.pdf',
  )

  const box = thread.getByRole('textbox', { name: 'Reply to Lena Fischer…' })
  await box.fill('Refund issued, sorry about that.')
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(status(page, 'Reply sent')).toBeAttached()
  await expect(box).toHaveValue('')
  await expect(thread.getByRole('list', { name: 'Messages' })).toContainText(
    'Refund issued, sorry about that.',
  )
})

test('inbox: filters, internal note, status and assignee', async ({ page }) => {
  await open(page, 'blocks-inbox--default')
  const list = page.getByRole('list', { name: 'Conversations' })
  await page.getByRole('radiogroup', { name: 'Filter' }).getByText('Mine').click()
  await expect(list.getByRole('button')).toHaveCount(1)
  await page.getByRole('searchbox', { name: 'Search conversations' }).fill('nothing like this')
  await expect(page.getByText('No conversation matches these filters.')).toBeVisible()
  await page.getByRole('searchbox', { name: 'Search conversations' }).fill('')

  const thread = page.getByRole('region', { name: 'SSO with Okta' })
  await thread
    .getByRole('radiogroup', { name: 'Reply or internal note' })
    .getByText('Internal note')
    .click()
  await thread.getByRole('textbox', { name: /Note for your team/ }).fill('Trial approved.')
  await thread.getByRole('button', { name: 'Add note' }).click()
  await expect(status(page, 'Note added')).toBeAttached()

  await thread.getByRole('button', { name: /Assignee/ }).click()
  await page.getByRole('menuitemradio', { name: 'Ada Lovelace' }).click()
  await expect(status(page, 'Assigned to Ada Lovelace')).toBeAttached()
  await expect(list.getByRole('button')).toHaveCount(0)
})

test('inbox: on a phone the list and the thread take turns', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await open(page, 'blocks-inbox--phone')
  await page.getByRole('button', { name: /Diego Ramírez/ }).click()
  const back = page.getByRole('button', { name: 'Back to the conversations' })
  await expect(back).toBeVisible()
  await expect(page.getByRole('list', { name: 'Conversations' })).toBeHidden()
  await back.click()
  await expect(page.getByRole('button', { name: /Diego Ramírez/ })).toBeFocused()
})

const grid = (page: Page) => page.getByRole('grid', { name: 'Q4 sales' })
const cell = (page: Page, row: number, col: number) =>
  grid(page).locator(`[data-cell="${String(row)}:${String(col)}"]`)

test('spreadsheet: type to edit, Enter saves and moves down, Escape cancels, undo', async ({
  page,
}) => {
  await open(page, 'blocks-spreadsheet--default')
  await cell(page, 0, 1).click()
  await expect(cell(page, 0, 1)).toBeFocused()
  await page.keyboard.type('Pro plan')
  await page.keyboard.press('Enter')
  await expect(cell(page, 0, 1)).toHaveText('Pro plan')
  await expect(cell(page, 1, 1)).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type('1 234,5')
  await page.keyboard.press('Tab')
  await expect(cell(page, 1, 3)).toHaveText('1,234.5')
  await expect(cell(page, 1, 4)).toBeFocused()

  await page.keyboard.press('F2')
  await page.keyboard.type('999')
  await page.keyboard.press('Escape')
  await expect(cell(page, 1, 4)).toHaveText('€49.00')

  await page.keyboard.press('ControlOrMeta+z')
  await expect(cell(page, 1, 3)).toHaveText('64')
  await expect(status(page, 'Undone')).toBeAttached()
})

test('spreadsheet: select a range, read the sum, copy, paste and clear', async ({ page }) => {
  await open(page, 'blocks-spreadsheet--default')
  await cell(page, 0, 3).click()
  await page.keyboard.press('Shift+ArrowDown')
  await page.keyboard.press('Shift+ArrowDown')
  await expect(page.getByText('Sum 198')).toBeVisible()
  await expect(grid(page).locator('[aria-selected=true]')).toHaveCount(3)

  // Copy writes tab-separated text to the clipboard event.
  const copied = await page.evaluate(() => {
    const data = new DataTransfer()
    const el = document.querySelector('[data-cell="2:3"]')
    el?.dispatchEvent(new ClipboardEvent('copy', { clipboardData: data, bubbles: true }))
    return data.getData('text/plain')
  })
  expect(copied).toBe('128\n64\n6')

  // A block pasted from another spreadsheet lands from the top-left of the selection.
  await cell(page, 0, 1).click()
  await page.evaluate(() => {
    const data = new DataTransfer()
    data.setData('text/plain', 'Alpha\tAPAC\t7\nBeta\tEU\t8\n')
    document
      .querySelector('[data-cell="0:1"]')
      ?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
  })
  await expect(cell(page, 0, 1)).toHaveText('Alpha')
  await expect(cell(page, 1, 2)).toHaveText('EU')
  await expect(cell(page, 1, 3)).toHaveText('8')
  await expect(status(page, '6 cells pasted')).toBeAttached()

  await page.keyboard.press('Delete')
  await expect(cell(page, 0, 1)).toHaveText('')
  await expect(cell(page, 1, 3)).toHaveText('')
})

test('spreadsheet: read-only columns can’t be edited, and Tab leaves the grid at the end', async ({
  page,
}) => {
  await open(page, 'blocks-spreadsheet--default')
  await cell(page, 0, 0).dblclick()
  await expect(grid(page).getByRole('textbox')).toHaveCount(0)
  await cell(page, 0, 5).click()
  await page.keyboard.press('Tab')
  await expect(cell(page, 0, 5)).not.toBeFocused()
})
