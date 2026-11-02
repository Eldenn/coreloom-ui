// Choice cards, segmented control, unit and duration inputs, month and week pickers, key-value
// editor, emoji picker, signature pad, password strength and copy input: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('radio cards: the whole card picks, arrows move, disabled is skipped', async ({ page }) => {
  await open(page, 'components-forms-choice-card--default')
  const group = page.getByRole('radiogroup', { name: 'Plan' })
  await page.getByText('One project, community support.').click()
  await expect(group.getByRole('radio', { name: 'Starter' })).toBeChecked()
  await expect(page.getByText('Picked: starter.')).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await expect(group.getByRole('radio', { name: 'Team' })).toBeChecked()
  await expect(group.getByRole('radio', { name: 'Enterprise' })).toBeDisabled()
  await expect(group.getByRole('radio', { name: 'Team' })).toHaveAccessibleDescription(
    /Unlimited projects/,
  )
})

test('checkbox cards toggle with a click on the card', async ({ page }) => {
  await open(page, 'components-forms-choice-card--checkboxes')
  const storage = page.getByRole('checkbox', { name: 'Extra storage' })
  await expect(storage).not.toBeChecked()
  await page.getByText('500 GB more').click()
  await expect(storage).toBeChecked()
})

test('segmented control is one tab stop and arrows change the pick', async ({ page }) => {
  await open(page, 'components-forms-segmented-control--default')
  const group = page.getByRole('radiogroup', { name: 'Period' })
  await group.getByText('Month').click()
  await expect(page.getByText('Showing the last month.')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(group.getByRole('radio', { name: 'Year' })).toBeChecked()
  await expect(page.getByText('Showing the last year.')).toBeVisible()
})

test('icon-only segments keep their names', async ({ page }) => {
  await open(page, 'components-forms-segmented-control--variants')
  await expect(page.getByRole('radio', { name: 'Board' })).toBeVisible()
})

test('unit input converts the number when the unit changes', async ({ page }) => {
  await open(page, 'components-forms-unit-and-duration-inputs--default')
  await page.getByRole('combobox', { name: 'Unit' }).first().selectOption('rem')
  await expect(page.getByLabel('Font size')).toHaveValue('1')
})

test('duration reads 1h30, 1:30 and 90, and arrows add 15 minutes', async ({ page }) => {
  await open(page, 'components-forms-unit-and-duration-inputs--default')
  const field = page.getByLabel('Meeting length')
  for (const typed of ['2h15', '2:15', '135', '2 h 15 min']) {
    await field.fill(typed)
    await expect(page.getByText('135 minutes')).toBeVisible()
  }
  await field.press('ArrowUp')
  await expect(page.getByText('150 minutes')).toBeVisible()
  await field.blur()
  await expect(field).toHaveValue('2 h 30 min')
  await field.fill('soon')
  await field.blur()
  await expect(field).toHaveAttribute('aria-invalid', 'true')
  await expect(field).toHaveAccessibleDescription(/Enter a duration/)
})

test('month picker: arrows move, Page Down changes year, Enter picks', async ({ page }) => {
  await open(page, 'components-forms-month-and-week-pickers--default')
  await page.getByLabel('Billing period').click()
  await expect(page.getByRole('button', { name: 'October 2026' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Value: 2026-11')).toBeVisible()
  await expect(page.getByLabel('Billing period')).toHaveText(/November 2026/)
  await page.getByLabel('Billing period').click()
  await expect(page.getByRole('button', { name: 'November 2026' })).toBeFocused()
  await page.keyboard.press('PageDown')
  await expect(page.getByRole('button', { name: 'November 2027' })).toBeDisabled()
})

test('week picker picks the week of the clicked day', async ({ page }) => {
  await open(page, 'components-forms-month-and-week-pickers--default')
  const trigger = page.getByLabel('Timesheet week')
  await expect(trigger).toHaveText(/Week 44/)
  await trigger.click()
  await page.getByRole('button', { name: 'Thursday 22 October 2026' }).click()
  await expect(page.getByText('Value: 2026-W43')).toBeVisible()
  await expect(trigger).toHaveText(/Week 43 · 19 Oct – 25 Oct 2026/)
})

test('key-value editor adds, removes, flags repeats and splits pasted lines', async ({ page }) => {
  await open(page, 'components-forms-key-value-editor--default')
  await page.getByRole('button', { name: 'Add row' }).click()
  const key3 = page.getByLabel('Key, row 3')
  await expect(key3).toBeFocused()
  await key3.fill('content-type')
  await expect(key3).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Each key can only be used once.')).toBeVisible()
  await page.getByRole('button', { name: 'Remove row 3' }).click()
  await expect(page.getByText('2 headers')).toBeVisible()
  await page.getByRole('button', { name: 'Add row' }).click()
  await expect(page.getByLabel('Key, row 3')).toBeFocused()
  await page.evaluate(() => {
    const input = document.activeElement as HTMLInputElement
    const data = new DataTransfer()
    data.setData('text/plain', 'Authorization: Bearer x\nAccept: text/html')
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
  })
  await expect(page.getByLabel('Key, row 4')).toHaveValue('Accept')
  await expect(page.getByLabel('Value, row 3')).toHaveValue('Bearer x')
})

test('emoji picker: search, arrows and Enter', async ({ page }) => {
  await open(page, 'components-forms-emoji-picker--default')
  await page.getByRole('button', { name: 'Add emoji' }).click()
  await page.getByLabel('Search emoji').fill('rocket')
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Message')).toHaveValue('Ship it 🚀')
  await page.getByRole('button', { name: 'Add emoji' }).click()
  await page.getByLabel('Search emoji').press('ArrowDown')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('button', { name: 'grinning face with big eyes' })).toBeFocused()
})

test('signature pad: drawing signs, clearing empties, typing is an alternative', async ({
  page,
}) => {
  await open(page, 'components-forms-signature-pad--default')
  const pad = page.getByRole('img', { name: /Signature/ })
  const box = await pad.boundingBox()
  if (!box) throw new Error('no pad')
  await page.mouse.move(box.x + 40, box.y + 60)
  await page.mouse.down()
  await page.mouse.move(box.x + 120, box.y + 90, { steps: 5 })
  await page.mouse.up()
  await expect(page.getByText('Signed.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(page.getByText('Sign to accept the delivery.')).toBeVisible()
  await page.getByRole('button', { name: 'Type instead' }).click()
  await page.getByLabel('Type your full name').fill('Ada Lovelace')
  await expect(page.getByText('Signed.')).toBeVisible()
})

test('password strength moves with the password and ticks rules', async ({ page }) => {
  await open(page, 'components-forms-password-strength--default')
  const field = page.getByLabel('New password')
  await field.fill('abc')
  await expect(field).toHaveAccessibleDescription(/Weak/)
  await field.fill('Sunflower-77-Garden')
  await expect(field).toHaveAccessibleDescription(/Strong/)
  await expect(page.locator('[data-slot=password-strength] li[data-met]')).toHaveCount(3)
})

test('copy input copies its value and says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await open(page, 'components-forms-input-group--copy')
  await page.getByRole('button', { name: 'Copy' }).first().click()
  await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeAttached()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://coreloom.dev/join/7f3a9c2e',
  )
})

test('the all-fields form shows each error when submitted empty', async ({ page }) => {
  await open(page, 'components-forms-form-fields-cards-masks-units-periods--with-errors')
  for (const message of [
    'Pick a plan.',
    'Pick at least one feature.',
    'Give a score.',
    'Pick a month.',
  ]) {
    await expect(page.getByText(message)).toBeVisible()
  }
  await page.getByRole('radio', { name: 'Team' }).check()
  await expect(page.getByText('Pick a plan.')).toBeHidden()
})

test('French labels', async ({ page }) => {
  await open(page, 'components-forms-key-value-editor--french', 'fr')
  await expect(page.getByRole('button', { name: 'Ajouter une ligne' })).toBeVisible()
  await expect(page.getByLabel('Clé, ligne 1')).toHaveValue('client')
})
