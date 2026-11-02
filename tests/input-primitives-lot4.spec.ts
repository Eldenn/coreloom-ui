// Chip group, scale, number and time ranges, creatable combobox, JSON input, mentions, tree select
// and transfer list: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('chips toggle, keep the options order, and single chips are radios', async ({ page }) => {
  await open(page, 'components-forms-chip-group--default')
  await page.getByText('This week').click()
  await page.getByText('Assigned to me').click()
  await expect(page.getByText('Filters: open, mine, week')).toBeVisible()
  await expect(page.getByRole('checkbox', { name: /Archived/ })).toBeDisabled()
  await page.getByRole('checkbox', { name: /Open/ }).press('Space')
  await expect(page.getByText('Filters: mine, week')).toBeVisible()

  await open(page, 'components-forms-chip-group--single')
  await expect(page.getByRole('radio', { name: 'M', exact: true })).toBeChecked()
  await page.getByRole('radio', { name: 'M', exact: true }).press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'L', exact: true })).toBeChecked()
})

test('scale: points carry the end words, arrows move', async ({ page }) => {
  await open(page, 'components-forms-scale-input--default')
  const group = page.getByRole('radiogroup', { name: /recommend Coreloom/ })
  await group.getByRole('radio', { name: '0, Not at all likely' }).check({ force: true })
  await expect(page.getByText('Score: 0')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByText('Score: 2')).toBeVisible()
  await expect(group.getByRole('radio', { name: '10, Extremely likely' })).toBeAttached()

  await open(page, 'components-forms-scale-input--likert')
  await expect(page.getByRole('radio', { name: 'Agree', exact: true })).toBeChecked()
})

test('ranges: each end is named and a reversed range is flagged', async ({ page }) => {
  await open(page, 'components-forms-range-inputs--default')
  const min = page.getByRole('spinbutton', { name: 'Minimum' })
  await min.fill('100')
  await min.blur()
  await expect(page.getByText('The minimum is higher than the maximum.')).toBeVisible()
  await expect(min).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('textbox', { name: 'Start' })).toBeVisible()

  await open(page, 'components-forms-range-inputs--problems')
  await expect(page.getByText('Ends the next day.')).toBeVisible()
  await expect(page.getByText('The end is before the start.')).toBeVisible()
})

test('combobox creates an option from the search', async ({ page }) => {
  await open(page, 'components-forms-pickers--creatable')
  await page.getByLabel('Label').click()
  await page.getByPlaceholder('Search or create…').fill('Needs design')
  await page.getByRole('option', { name: 'Create “Needs design”' }).click()
  await expect(page.getByText('Value: needs-design')).toBeVisible()
  await expect(page.getByLabel('Label')).toHaveText('Needs design')
})

test('JSON input says where it breaks and formats', async ({ page }) => {
  await open(page, 'components-forms-json-input--default')
  const field = page.getByLabel('Webhook payload')
  await field.fill('{"event": "invoice.paid",\n "amount": }')
  await field.blur()
  await expect(page.getByText('This isn’t valid JSON: check line 2, column 12.')).toBeVisible()
  await expect(field).toHaveAttribute('aria-invalid', 'true')
  await field.fill('{"a":1,"b":[true]}')
  await expect(page.getByText(/This isn’t valid JSON/)).toBeHidden()
  await expect(page.getByText('2 keys')).toBeVisible()
  await page.getByRole('button', { name: 'Format' }).click()
  await expect(field).toHaveValue('{\n  "a": 1,\n  "b": [\n    true\n  ]\n}')
  await field.focus()
  await page.keyboard.press('End')
  await page.keyboard.press('Tab')
  await expect(field).toBeFocused()
})

test('mentions: typing @ suggests, arrows and Enter insert the handle', async ({ page }) => {
  await open(page, 'components-forms-mention-textarea--default')
  const area = page.getByLabel('Comment')
  await area.fill('Thanks @a')
  await expect(page.getByRole('listbox', { name: 'Suggestions' })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: '5 suggestions' })).toBeAttached()
  await area.press('ArrowDown')
  await expect(page.getByRole('option', { name: /Alan Turing/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await area.press('Enter')
  await expect(area).toHaveValue('Thanks @alan ')
  await expect(page.getByText('Notifies: alan')).toBeVisible()
  await area.pressSequentially('and @gr')
  await area.press('Escape')
  await expect(page.getByRole('listbox', { name: 'Suggestions' })).toBeHidden()
})

test('tree select: arrows walk the tree, Right opens, Enter picks', async ({ page }) => {
  await open(page, 'components-forms-tree-select--default')
  const trigger = page.getByLabel('Team', { exact: true })
  await expect(trigger).toHaveText('Engineering / Frontend / Design system')
  await trigger.click()
  const tree = page.getByRole('tree')
  await expect(tree.getByRole('treeitem', { name: 'Design system' })).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(tree.getByRole('treeitem', { name: /^Frontend/ })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(tree.getByRole('treeitem', { name: 'Backend' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Value: be')).toBeVisible()
  await expect(trigger).toHaveText('Engineering / Backend')

  await page.getByLabel('Visible to').click()
  await page.getByRole('treeitem', { name: /^Sales/ }).click()
  await expect(page.getByText('Values: be, design, sales')).toBeVisible()
})

test('transfer list moves ticked items and announces it', async ({ page }) => {
  await open(page, 'components-forms-transfer-list--default')
  await page.getByRole('checkbox', { name: 'Role' }).check()
  await page.getByRole('checkbox', { name: 'Team' }).check()
  await page.getByRole('button', { name: 'Add 2 ticked' }).click()
  await expect(page.getByText('Shown: name, email, role, team, plan')).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: '2 moved to Shown.' })).toBeAttached()
  await page.getByRole('searchbox', { name: 'Filter (Hidden)' }).fill('rev')
  await expect(page.getByRole('checkbox', { name: 'Monthly revenue' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Created' })).toBeHidden()
  await page.getByRole('button', { name: 'Remove all' }).click()
  await expect(page.getByText('Shown: name')).toBeVisible()
})

test('the filter-fields form shows each error when submitted empty', async ({ page }) => {
  await open(page, 'components-forms-form-fields-chips-scales-ranges-json-trees--with-errors')
  for (const message of [
    'Pick at least one topic.',
    'Pick a score.',
    'Enter both times.',
    'Write a note.',
    'Pick a team.',
  ]) {
    await expect(page.getByText(message)).toBeVisible()
  }
})

test('French labels', async ({ page }) => {
  await open(page, 'components-forms-transfer-list--french', 'fr')
  await expect(page.getByRole('button', { name: 'Tout ajouter' })).toBeVisible()
  await open(page, 'components-forms-tree-select--french', 'fr')
  await expect(page.getByLabel('Équipes')).toHaveText('2 sélectionnés')
})
