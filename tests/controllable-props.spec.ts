// Components that keep their own value or open state (`defaultValue`, `defaultOpen`) and the ones
// a page owns (`value` / `open` with their change callbacks). Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

test.describe('Model list with defaultValue (Components/AI/Model picker)', () => {
  test('starts on the default model and keeps the next choice itself', async ({ page }) => {
    await open(page, 'components-ai-model-picker--list')
    const sonnet = page.getByRole('option', { name: /Claude Sonnet/ })
    const haiku = page.getByRole('option', { name: /Claude Haiku/ })
    await expect(sonnet).toContainText('Selected')
    await expect(haiku).not.toContainText('Selected')

    await haiku.click()
    await expect(haiku).toContainText('Selected')
    await expect(sonnet).not.toContainText('Selected')
  })
})

test.describe('Faceted filter with defaultValue (Blocks/Data list)', () => {
  test('starts with the default choice and toggles options itself', async ({ page }) => {
    await open(page, 'blocks-data-list--faceted-filter-alone')
    const trigger = page.getByRole('button', { name: 'Filter by Status' })
    // The trigger lists what is chosen, as badges.
    await expect(trigger).toHaveText(/Status\s*Failed$/)
    await trigger.click()

    await page.getByRole('option', { name: /Ready/ }).click()
    await expect(trigger).toHaveText(/Status\s*ReadyFailed$/)
    await page.getByRole('option', { name: /Failed/ }).click()
    await expect(trigger).toHaveText(/Status\s*Ready$/)

    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(trigger).toHaveText('Status')
  })
})

test.describe('Agent plan with open (Components/AI/Agent plan)', () => {
  test('shows the steps when the page opens it, and reports its own toggle', async ({ page }) => {
    await open(page, 'components-ai-agent-plan--controlled')
    const toggle = page.getByRole('button', { name: 'Show the steps' })
    const trigger = page.locator('[data-slot="agent-plan"] > button')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')

    // The plan's own trigger goes through onOpenChange, so the page's state follows.
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })
})
