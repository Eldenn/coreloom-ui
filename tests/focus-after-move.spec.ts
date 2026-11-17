// File manager, kanban and form builder: when what had focus goes away (a folder opens, a card
// changes column, a field is deleted), focus lands somewhere meaningful, never on the page.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

test.describe('file manager', () => {
  test('focus follows into a folder and back up', async ({ page }) => {
    await open(page, 'blocks-file-manager--default')
    const root = page.getByRole('listbox', { name: 'Contents of All files' })
    await root.getByRole('option', { name: /^Design/ }).focus()
    await page.keyboard.press('Enter')
    const design = page.getByRole('listbox', { name: 'Contents of Design' })
    await expect(design.getByRole('option').first()).toBeFocused()

    await page.keyboard.press('Backspace')
    await expect(root.getByRole('option').first()).toBeFocused()

    await root.getByRole('option', { name: /^Design/ }).focus()
    await page.keyboard.press('Enter')
    await expect(design.getByRole('option').first()).toBeFocused()
    await page.keyboard.press('Alt+ArrowUp')
    await expect(root.getByRole('option').first()).toBeFocused()
  })

  test('Delete keeps focus in the list and clears the selection', async ({ page }) => {
    await open(page, 'blocks-file-manager--default')
    const root = page.getByRole('listbox', { name: 'Contents of All files' })
    const file = root.getByRole('option', { name: /customers-export\.csv/ })
    await file.focus()
    await page.keyboard.press('Space')
    await expect(file).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Delete')
    await expect(file).toHaveCount(0)
    await expect(root.getByRole('option', { selected: true })).toHaveCount(0)
    await expect(page.getByRole('toolbar', { name: 'Selected items' })).toHaveCount(0)
    await expect(root.getByRole('option').first()).toBeFocused()
  })

  test('deleting the last item of a folder focuses the empty state, and Backspace still goes up', async ({
    page,
  }) => {
    await open(page, 'blocks-file-manager--default')
    await page.getByRole('option', { name: /^Design/ }).focus()
    await page.keyboard.press('Enter')
    const design = page.getByRole('listbox', { name: 'Contents of Design' })
    await expect(design.getByRole('option', { name: /^Brand/ })).toBeFocused()
    await page.keyboard.press('Enter')
    const brand = page.getByRole('listbox', { name: 'Contents of Brand' })
    await expect(brand.getByRole('option').first()).toBeFocused()
    await page.keyboard.press('Space')
    await expect(brand.getByRole('option', { selected: true })).toHaveCount(1)
    await page.keyboard.press('Delete')
    const empty = page.locator('[data-slot=empty]')
    await expect(empty).toContainText('This folder is empty')
    await expect(empty).toBeFocused()
    await page.keyboard.press('Backspace')
    await expect(design.getByRole('option').first()).toBeFocused()
  })

  test('Clear moves focus to the list before its toolbar goes', async ({ page }) => {
    await open(page, 'blocks-file-manager--default')
    // The story opens with Roadmap 2027.md selected.
    await page
      .getByRole('toolbar', { name: 'Selected items' })
      .getByRole('button', { name: 'Clear' })
      .press('Enter')
    await expect(page.getByRole('toolbar', { name: 'Selected items' })).toHaveCount(0)
    await expect(page.getByRole('option').first()).toBeFocused()
  })

  test('a sort button says its direction', async ({ page }) => {
    await open(page, 'blocks-file-manager--list-view')
    await expect(
      page.getByRole('button', { name: 'Sort by Name, sorted ascending' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Sort by Name' }).click()
    await expect(
      page.getByRole('button', { name: 'Sort by Name, sorted descending' }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sort by Size', exact: true })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})

test('kanban: Move to from the keyboard keeps focus on the card, in its new column', async ({
  page,
}) => {
  await open(page, 'blocks-workspace--kanban')
  await page.getByRole('button', { name: 'Actions for Kanban block' }).press('Enter')
  await page.getByRole('menuitem', { name: 'Done' }).press('Enter')
  const done = page.getByRole('region', { name: 'Done', exact: true })
  await expect(done.getByRole('button', { name: 'Actions for Kanban block' })).toBeFocused()
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test.describe('form builder', () => {
  const BUILDER = 'blocks-forms-form-builder--default'

  test('deleting a field selects its section and focuses it', async ({ page }) => {
    await open(page, BUILDER)
    await page.getByRole('button', { name: 'Delete Phone', exact: true }).press('Enter')
    await expect(page.getByRole('button', { name: 'Edit Phone', exact: true })).toHaveCount(0)
    const section = page.getByRole('button', { name: 'Edit section You', exact: true })
    await expect(section).toHaveAttribute('aria-pressed', 'true')
    await expect(section).toBeFocused()
  })

  test('deleting a section selects the form and focuses it', async ({ page }) => {
    await open(page, BUILDER)
    await page.getByRole('button', { name: 'Edit section Your team', exact: true }).press('Enter')
    await page.getByRole('button', { name: 'Delete section', exact: true }).press('Enter')
    await expect(
      page.getByRole('button', { name: 'Edit section Your team', exact: true }),
    ).toHaveCount(0)
    const form = page.getByRole('button', { name: 'Form settings', exact: true })
    await expect(form).toHaveAttribute('aria-pressed', 'true')
    await expect(form).toBeFocused()
  })

  test('removing the last option focuses the one before it', async ({ page }) => {
    await open(page, BUILDER)
    await page.getByRole('button', { name: 'Edit Role', exact: true }).press('Enter')
    await page.getByRole('button', { name: 'Remove Other', exact: true }).press('Enter')
    await expect(page.getByRole('textbox', { name: 'Option 4 label' })).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Option 3 label' })).toBeFocused()
  })
})
