// Form errors, sortable headers and boxes that scroll: what a keyboard and a screen reader get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

test('a failed submit: focus on the first invalid field, one polite summary, no alert per field', async ({
  page,
}) => {
  await open(page, 'components-forms-form-tanstack--create-project')
  const form = page.locator('form')
  const status = form.getByRole('status')
  // The status is there before it has anything to say, so that what it says later is announced.
  await expect(status).toHaveCount(1)
  await expect(status).toHaveText('')

  await form.getByRole('button', { name: 'Create project' }).focus()
  await page.keyboard.press('Enter')

  const name = form.getByRole('textbox', { name: 'Project name' })
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(name).toHaveAccessibleDescription(/Use at least 3 characters\./)

  await expect(form.locator('[data-slot=field-error]')).toHaveCount(4)
  await expect(status).toHaveCount(1)
  await expect(status).toHaveText('4 fields need attention.')
  await expect(form.getByRole('alert')).toHaveCount(0)

  // The summary follows the fields as they are corrected.
  await name.fill('acme-web')
  await expect(name).not.toHaveAttribute('aria-invalid', 'true')
  await expect(status).toHaveText('3 fields need attention.')
})

test('a form submitted from code shows its errors without taking focus', async ({ page }) => {
  await open(page, 'components-forms-form-tanstack--with-errors')
  const form = page.locator('form')
  await expect(form.locator('[data-slot=field-error]')).toHaveCount(4)
  await expect(form.getByRole('status')).toHaveText('4 fields need attention.')
  await expect(form.getByRole('textbox', { name: 'Project name' })).not.toBeFocused()
})

test('data table: sorting a column says so on its header', async ({ page }) => {
  await open(page, 'components-tables--data-table-story')
  const header = page.getByRole('columnheader', { name: 'Sort by Project' })
  const duration = page.getByRole('columnheader', { name: 'Sort by Duration' })
  const sort = header.getByRole('button', { name: 'Sort by Project' })
  await expect(header).toHaveAttribute('aria-sort', 'none')
  await sort.click()
  await expect(header).toHaveAttribute('aria-sort', 'ascending')
  await expect(duration).toHaveAttribute('aria-sort', 'none')
  await sort.click()
  await expect(header).toHaveAttribute('aria-sort', 'descending')
  await sort.click()
  await expect(header).toHaveAttribute('aria-sort', 'none')
})

test('diff viewer: a tab stop and a name only while its lines scroll', async ({ page }) => {
  await open(page, 'components-data-display-diff-viewer--default')
  const diff = page.locator('[data-slot=diff-viewer]')
  await expect(diff).toContainText('4 lines added')
  const region = diff.getByRole('group', { name: 'package.json' })

  // Too narrow for the lines: the box scrolls, so the keyboard must be able to reach it.
  await page.setViewportSize({ width: 240, height: 800 })
  await expect(region).toBeVisible()
  await expect(region).toHaveAttribute('tabindex', '0')
  await region.focus()
  await expect(region).toBeFocused()

  // Wide enough again: nothing to scroll, no extra tab stop.
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(region).toHaveCount(0)
  await expect(diff.locator('[tabindex]')).toHaveCount(0)
})
