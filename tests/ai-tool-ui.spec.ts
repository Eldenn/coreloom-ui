// Generative UI: tool calls drawn as the app's own components (`Chat`'s `tools`, `ToolCall`'s `tool`).
// Inline components replace the card, card components replace its JSON, and a component that asks
// answers the approval with its own buttons. Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Generative UI (Components/AI/Tool call, Blocks/AI/Chat)', () => {
  test('an inline component replaces the card and is named after the tool', async ({ page }) => {
    await open(page, 'components-ai-tool-call--generative-inline')
    const call = page.getByRole('group', { name: 'Weather' })
    await expect(call).toContainText('14°C')
    await expect(call).not.toHaveAttribute('aria-busy')
    // No folded card around it: no trigger, no JSON.
    await expect(page.getByRole('button')).toHaveCount(0)
    await expect(page.locator('#storybook-root')).not.toContainText('"celsius"')
  })

  test('while the tool runs, the inline component is busy and says what it is doing', async ({
    page,
  }) => {
    await open(page, 'components-ai-tool-call--generative-loading')
    const call = page.getByRole('group', { name: 'Weather' })
    await expect(call).toHaveAttribute('aria-busy', 'true')
    await expect(call).toContainText('Getting the weather in Lyon…')
  })

  test('in the card, the component replaces the JSON and the card opens', async ({ page }) => {
    await open(page, 'components-ai-tool-call--generative-in-card')
    const card = page.locator('[data-slot="tool-call"]')
    await expect(card.getByRole('button', { name: /Search the docs/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(card.getByRole('link', { name: /Roll back a deployment/ })).toBeVisible()
    await expect(card).not.toContainText('"query"')
  })

  test('a component answers the approval with its own buttons; focus stays on the call', async ({
    page,
  }) => {
    await open(page, 'components-ai-tool-call--generative-approval')
    const call = page.getByRole('group', { name: 'Book a meeting' })
    await expect(call).toContainText('Rollback review')
    // The card's own Allow / Deny don't show: the component draws the question.
    await expect(page.getByRole('button', { name: 'Allow' })).toHaveCount(0)
    await call.getByRole('button', { name: 'Book it' }).focus()
    await page.keyboard.press('Enter')
    await expect(call).toContainText('Booked')
    await expect(call.getByRole('button')).toHaveCount(0)
    await expect(call).toBeFocused()
  })

  test('Allow in the card keeps focus on the card', async ({ page }) => {
    await open(page, 'components-ai-tool-call--states')
    const card = page.locator('[data-slot="tool-call"]').filter({ hasText: 'Roll back production' })
    await card.getByRole('button', { name: 'Allow' }).focus()
    await page.keyboard.press('Enter')
    await expect(card).toContainText('Done')
    await expect(card.getByRole('button', { name: /Roll back production/ })).toBeFocused()
  })

  test('in the chat, each tool draws its way; Not now denies the booking', async ({ page }) => {
    await open(page, 'blocks-ai-chat--generative-ui')
    const log = page.getByRole('log', { name: 'Conversation' })
    await expect(log.getByRole('group', { name: 'Weather' })).toContainText('Rain')
    await expect(log.getByRole('link', { name: /Deployment protection/ })).toBeVisible()
    const booking = log.getByRole('group', { name: 'Book a meeting' })
    await booking.getByRole('button', { name: 'Not now' }).click()
    await expect(booking).toContainText('Not booked')
  })

  test('the components follow the locale', async ({ page }) => {
    await open(page, 'blocks-ai-chat--generative-ui-french', 'fr')
    const booking = page.getByRole('group', { name: 'Book a meeting' })
    await expect(booking).toContainText('jeudi 15 octobre')
    await expect(booking.getByRole('button', { name: 'Réserver' })).toBeVisible()
  })

  test('live: the skeleton shows while the tool runs, then the forecast', async ({ page }) => {
    await open(page, 'blocks-ai-chat--generative-ui-live')
    await page.getByRole('button', { name: 'Will it rain in Lyon this week?' }).click()
    const call = page.getByRole('group', { name: 'Weather' })
    await expect(call).toHaveAttribute('aria-busy', 'true')
    await expect(call).toContainText('14°C', { timeout: 10_000 })
    await expect(call).not.toHaveAttribute('aria-busy')
  })
})
