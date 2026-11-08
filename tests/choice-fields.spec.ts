// Checkbox cards, exclusive choices, one-line Markdown and sortable items with their own actions.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark', 'en')
const SURVEY = 'components-forms-form-fields-checkbox-cards-and-exclusive-choices--'

test('an exclusive option clears the others, and another option clears it', async ({ page }) => {
  await open(page, `${SURVEY}filled`)
  const unit = page.getByRole('checkbox', { name: 'Unit tests' })
  const e2e = page.getByRole('checkbox', { name: 'End-to-end tests' })
  const none = page.getByRole('checkbox', { name: 'No tests' })
  await expect(unit).toBeChecked()
  await none.click()
  await expect(none).toBeChecked()
  await expect(unit).not.toBeChecked()
  await expect(e2e).not.toBeChecked()
  await unit.click()
  await expect(unit).toBeChecked()
  await expect(none).not.toBeChecked()
})

test('checkbox cards tick with Space and report an empty choice', async ({ page }) => {
  await open(page, `${SURVEY}default`)
  const group = page.getByRole('group', { name: 'Coding tools' })
  const editor = group.getByRole('checkbox', { name: /Editor assistant/ })
  await editor.focus()
  await page.keyboard.press('Space')
  await expect(editor).toBeChecked()
  await page.keyboard.press('Space')
  await expect(editor).not.toBeChecked()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Pick at least one tool.')).toBeVisible()
})

test('inline Markdown keeps inline code and drops block markup', async ({ page }) => {
  await open(page, 'components-ai-markdown--inline')
  const inline = page.locator('[data-slot="markdown"][data-inline]').first()
  await expect(inline.locator('code')).toHaveText('any')
  await expect(page.locator('[data-slot="markdown"] :is(p, h1, ul, li)')).toHaveCount(0)
  await expect(page.getByText('Not a heading')).toBeVisible()
})

test('a sortable item keeps its own actions after the move buttons', async ({ page }) => {
  await open(page, 'components-forms-sortable-list--with-actions')
  const items = page.locator('[data-slot="sortable-item"]')
  await expect(items).toHaveCount(3)
  await page.getByRole('button', { name: /^Delete Run pnpm lint/ }).click()
  await expect(items).toHaveCount(2)
  await page.getByRole('button', { name: /Move Use date-fns.* down/ }).click()
  await expect(items.first()).toContainText('Keep each component under 150 lines')
})
