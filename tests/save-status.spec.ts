// SaveStatus and DiagramCard: what each state says, one announcement per settled state, focus
// after Retry; the card as one link with a separate actions menu. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Save status (Components/Feedback/Save status)', () => {
  test('says each state, with when it was saved', async ({ page }) => {
    await open(page, 'components-feedback-save-status--all-states')
    const lines = page.locator('[data-slot="save-status"]')
    await expect(lines.nth(0)).toContainText('Saved')
    await expect(lines.nth(0)).toContainText('2 minutes ago')
    await expect(lines.nth(1)).toContainText('Saving…')
    await expect(lines.nth(2)).toContainText('Unsaved changes')
    await expect(lines.nth(3)).toContainText('Couldn’t save')
    await expect(lines.nth(3).getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('announces when the state settles, not while saving', async ({ page }) => {
    await open(page, 'components-feedback-save-status--autosave')
    const status = page.getByRole('status')
    await expect(status).toHaveText('Saved')
    await page.getByRole('textbox', { name: 'Name' }).fill('Order service v2')
    await expect(status).toHaveText('Unsaved changes')
    await expect(page.getByText('Saving…')).toBeVisible()
    // While the save runs, the status keeps its last message.
    await expect(status).toHaveText('Unsaved changes')
    await expect(status).toHaveText('Saved', { timeout: 5000 })
  })

  test('Retry saves again and keeps focus on the status line', async ({ page }) => {
    await open(page, 'components-feedback-save-status--autosave')
    await page.getByRole('checkbox', { name: 'Fail next save' }).check()
    await page.getByRole('textbox', { name: 'Name' }).fill('Order service v3')
    const status = page.getByRole('status')
    await expect(status).toHaveText('Couldn’t save', { timeout: 5000 })
    await page.getByRole('button', { name: 'Retry' }).click()
    await expect(page.locator('[data-slot="save-status"]')).toBeFocused()
    await expect(status).toHaveText('Saved', { timeout: 5000 })
  })

  test('speaks French', async ({ page }) => {
    await open(page, 'components-feedback-save-status--french', 'fr')
    await expect(page.locator('[data-state="unsaved"]')).toContainText(
      'Modifications non enregistrées',
    )
    await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible()
  })
})

test.describe('Diagram card (Blocks/Diagrams/Diagram card)', () => {
  test('is one link named by its title, with a separate menu', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-card--default')
    const card = page.getByRole('article', { name: 'Checkout' })
    await expect(card.getByRole('link')).toHaveAccessibleName('Checkout')
    await expect(card.getByRole('link')).toHaveAttribute('href', '#checkout')
    await expect(card.getByText('Public')).toBeVisible()
    await expect(card.getByText('4 diagrams')).toBeVisible()
    await expect(card.getByText('Updated 5 minutes ago')).toBeVisible()
    // The thumbnail is hidden from screen readers and holds nothing to focus.
    await expect(card.getByRole('img')).toHaveCount(0)
    await card.getByRole('link').focus()
    await page.keyboard.press('Tab')
    const menu = card.getByRole('button', { name: 'Actions for Checkout' })
    await expect(menu).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeFocused()
  })

  test('a click on the thumbnail follows the link', async ({ page }) => {
    await open(page, 'blocks-diagrams-diagram-card--default')
    // The thumbnail lets clicks through to the link stretched over the card.
    await page.getByRole('article', { name: 'Checkout' }).click({ position: { x: 60, y: 60 } })
    await expect(page).toHaveURL(/#checkout$/)
  })

  test('shows a neutral drawing without a diagram, and no menu without actions', async ({
    page,
  }) => {
    await open(page, 'blocks-diagrams-diagram-card--empty')
    await expect(page.getByText('Private')).toBeVisible()
    await open(page, 'blocks-diagrams-diagram-card--no-actions')
    await expect(page.getByRole('button')).toHaveCount(0)
  })
})
