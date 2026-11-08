// FilterBar and QueryBuilder: adding, editing and removing filters with the keyboard, where focus
// goes when a chip or a condition disappears, the announced result count, and nested groups.
// Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Filter bar (Components/Forms/Filter bar)', () => {
  test('adds a filter with the keyboard and filters the table', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--with-table')
    const bar = page.getByRole('group', { name: 'Filters' })
    await expect(bar.getByText('3 results')).toBeVisible()
    await expect(page.getByRole('row')).toHaveCount(4)

    await bar.getByRole('button', { name: 'Add filter' }).focus()
    await page.keyboard.press('Enter')
    await page.keyboard.type('custo')
    await page.keyboard.press('Enter')
    // The new chip opens on its own, its value focused.
    const value = page.getByRole('textbox', { name: 'Value' })
    await expect(value).toBeFocused()
    await page.keyboard.type('glob')
    await page.keyboard.press('Escape')

    const chip = bar.getByRole('button', { name: 'Edit filter: Customer contains “glob”' })
    await expect(chip).toBeFocused()
    await expect(bar.getByText('1 result', { exact: true })).toBeVisible()
    await expect(page.getByRole('row')).toHaveCount(2)
    await expect(page.getByRole('cell', { name: 'Globex' })).toBeVisible()
  })

  test('edits a chip’s operator and value', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--with-table')
    const bar = page.getByRole('group', { name: 'Filters' })
    await bar.getByRole('button', { name: 'Edit filter: Amount is at least 500' }).click()
    await page.getByRole('combobox', { name: 'Operator' }).click()
    await page.getByRole('option', { name: 'is between' }).click()
    // 500 doesn't fit a range: the value starts over and the chip says it needs one.
    await expect(bar.getByRole('button', { name: 'Edit filter: Amount is between' })).toContainText(
      'needs a value',
    )
    await page.getByRole('spinbutton', { name: 'From' }).fill('1000')
    await page.getByRole('spinbutton', { name: 'To' }).fill('9000')
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(
      bar.getByRole('button', { name: 'Edit filter: Amount is between 1,000 and 9,000' }),
    ).toBeFocused()
    await expect(bar.getByText('2 results')).toBeVisible()
  })

  test('removing a chip moves focus to its neighbour, then to Add filter', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--default')
    const bar = page.getByRole('group', { name: 'Filters' })
    await bar
      .getByRole('button', { name: 'Remove filter: Status is any of Open or Overdue' })
      .click()
    await expect(
      bar.getByRole('button', { name: 'Edit filter: Amount is at least 500' }),
    ).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(
      bar.getByRole('button', { name: 'Remove filter: Amount is at least 500' }),
    ).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(bar.getByRole('button', { name: 'Add filter' })).toBeFocused()
    await expect(bar.getByRole('button', { name: 'Clear filters' })).toHaveCount(0)
  })

  test('clear filters empties the bar and focuses Add filter', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--default')
    const bar = page.getByRole('group', { name: 'Filters' })
    await bar.getByRole('button', { name: 'Clear filters' }).click()
    await expect(bar.getByRole('button', { name: /^Edit filter/ })).toHaveCount(0)
    await expect(bar.getByRole('button', { name: 'Add filter' })).toBeFocused()
  })

  test('saved views switch the filter and Save view appears for a custom one', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--with-views')
    const bar = page.getByRole('group', { name: 'Filters' })
    const view = bar.getByRole('combobox', { name: 'View' })
    await expect(view).toHaveText('Unpaid over 500')
    await expect(bar.getByRole('button', { name: 'Save view' })).toHaveCount(0)
    await view.click()
    await page.getByRole('option', { name: 'Enterprise' }).click()
    await expect(
      bar.getByRole('button', { name: 'Edit filter: Tags is any of Enterprise' }),
    ).toBeVisible()
    await expect(bar.getByText('3 results')).toBeVisible()
    await bar.getByRole('button', { name: 'Remove filter: Tags is any of Enterprise' }).click()
    await bar.getByRole('button', { name: 'Add filter' }).click()
    await page.getByRole('option', { name: 'Recurring' }).click()
    await page.keyboard.press('Escape')
    await expect(view).toHaveText('Custom')
    await bar.getByRole('button', { name: 'Save view' }).click()
    await expect(view).toHaveText('My view')
  })

  test('announces the result count politely', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--with-table')
    const live = page.getByRole('group', { name: 'Filters' }).locator('[aria-live="polite"]')
    await expect(live).toHaveCount(1)
    await expect(live).toHaveText('3 results')
  })

  test('speaks French', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--french', 'fr')
    const bar = page.getByRole('group', { name: 'Filtres' })
    await expect(bar.getByRole('button', { name: 'Ajouter un filtre' })).toBeVisible()
    await expect(
      bar.getByRole('button', { name: /^Modifier le filtre : Émise le est entre/ }),
    ).toBeVisible()
    await expect(
      bar.getByRole('button', { name: 'Modifier le filtre : Groupe de 2 conditions' }),
    ).toBeVisible()
  })
})

test.describe('Query builder (Components/Forms/Filter bar)', () => {
  test('adds a condition and a nested group, focusing what appears', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--empty-builder')
    const root = page.getByRole('group', { name: 'Filters' })
    await expect(root.getByText('No condition yet.')).toBeVisible()
    await root.getByRole('button', { name: 'Add condition' }).click()
    await expect(root.getByRole('combobox', { name: 'Field' })).toBeFocused()

    await root.getByRole('button', { name: 'Add group' }).click()
    const inner = root.getByRole('group', { name: 'Group: Match all' })
    await expect(inner.getByRole('combobox', { name: 'Field' })).toBeFocused()
    // maxDepth 2: no group inside the group.
    await expect(inner.getByRole('button', { name: 'Add group' })).toHaveCount(0)

    await inner.getByRole('combobox', { name: 'Match' }).click()
    await page.getByRole('option', { name: 'Match any' }).click()
    await expect(root.getByRole('group', { name: 'Group: Match any' })).toBeVisible()
  })

  test('removing a condition or a group keeps focus in the builder', async ({ page }) => {
    await open(page, 'components-forms-filter-bar--builder')
    const root = page.getByRole('group', { name: 'Filters' })
    await expect(page.getByText('2 of 7 invoices match.')).toBeVisible()
    const inner = root.getByRole('group', { name: 'Group: Match any' })
    const removeButtons = inner.getByRole('button', { name: 'Remove condition' })
    await removeButtons.last().click()
    await expect(inner.getByRole('combobox', { name: 'Field' })).toBeFocused()
    await removeButtons.first().click()
    await expect(inner.getByRole('button', { name: 'Add condition' })).toBeFocused()
    await inner.getByRole('button', { name: 'Remove group' }).click()
    // The group was last: focus goes to the condition before it.
    await expect(root.getByRole('combobox', { name: 'Field' })).toBeFocused()
    await expect(root.getByRole('group')).toHaveCount(0)
    await expect(page.getByText('5 of 7 invoices match.')).toBeVisible()
  })
})
