// The chat widget: the launcher opens and closes the panel, focus goes where the reader expects, the
// greeting can be dismissed, the unread count is said, and a message gets its (canned) reply.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)
const WIDGET = 'blocks-ai-chat-widget--'

test.describe('AI chat widget', () => {
  test('the launcher opens it on click; focus goes to the composer; Escape closes and gives focus back', async ({
    page,
  }) => {
    await open(page, `${WIDGET}closed`)
    const launcher = page.getByRole('button', { name: /^Chat/ })
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    await expect(panel).toBeHidden()
    await expect(launcher).toHaveAttribute('aria-expanded', 'false')
    await launcher.click()
    await expect(panel).toBeVisible()
    await expect(launcher).toHaveAttribute('aria-expanded', 'true')
    await expect(panel.getByRole('textbox', { name: 'Message' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(launcher).toBeFocused()
  })

  test('the launcher opens with the keyboard; Minimise folds it back', async ({ page }) => {
    await open(page, `${WIDGET}closed`)
    const launcher = page.getByRole('button', { name: /^Chat/ })
    await launcher.focus()
    await page.keyboard.press('Enter')
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    await expect(panel.getByRole('textbox', { name: 'Message' })).toBeFocused()
    await panel.getByRole('button', { name: 'Minimise chat' }).click()
    await expect(panel).toBeHidden()
    await expect(launcher).toBeFocused()
    await page.keyboard.press('Space')
    await expect(panel).toBeVisible()
  })

  test("the unread count is part of the launcher's name and goes once opened", async ({ page }) => {
    await open(page, `${WIDGET}closed`)
    await expect(page.getByRole('button', { name: 'Chat, 2 unread' })).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: '2 unread messages' })).toBeAttached()
    await page.getByRole('button', { name: 'Chat, 2 unread' }).click()
    await expect(page.getByRole('button', { name: 'Chat', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  test('the greeting can be dismissed, and opening from it works too', async ({ page }) => {
    await open(page, `${WIDGET}closed`)
    const greeting = page.getByRole('button', { name: 'Hi! Questions about deploys?' })
    await expect(greeting).toBeVisible()
    await page.getByRole('button', { name: 'Dismiss message' }).click()
    await expect(greeting).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^Chat/ })).toBeFocused()

    await open(page, `${WIDGET}closed`)
    await page.getByRole('button', { name: 'Hi! Questions about deploys?' }).click()
    await expect(page.getByRole('dialog', { name: 'Chat with Coreloom' })).toBeVisible()
    await page.keyboard.press('Escape')
    // Opened once: the greeting doesn't come back.
    await expect(page.getByRole('button', { name: 'Hi! Questions about deploys?' })).toHaveCount(0)
  })

  test('sending a message shows a reply', async ({ page }) => {
    await open(page, `${WIDGET}open`)
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    const box = panel.getByRole('textbox', { name: 'Message' })
    await box.fill('Is my build ready?')
    await page.keyboard.press('Enter')
    const log = panel.getByRole('log', { name: 'Conversation' })
    await expect(log).toContainText('Is my build ready?')
    await expect(log).toContainText('your last build of coreloom-api is ready')
  })

  test('a reply that arrives while closed adds to the unread count', async ({ page }) => {
    await open(page, `${WIDGET}open`)
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    await panel.getByRole('textbox', { name: 'Message' }).fill('Ping')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Chat, 1 unread' })).toBeVisible()
  })

  test('on a phone it covers the page and keeps Tab inside', async ({ page }) => {
    await open(page, `${WIDGET}on-phone`)
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    await expect(panel).toHaveAttribute('aria-modal', 'true')
    await panel.getByRole('textbox', { name: 'Message' }).focus()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      expect(await panel.evaluate((d) => d.contains(document.activeElement))).toBe(true)
    }
    // Focus is on a button whose tooltip shows: one Escape still closes the chat.
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(page.getByRole('button', { name: /^Chat/ })).toBeFocused()
  })

  test('in French', async ({ page }) => {
    await open(page, `${WIDGET}french`, 'fr')
    await expect(page.getByRole('dialog', { name: 'Discuter avec Coreloom' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Réduire le chat' })).toBeVisible()
  })

  test('Escape on an open citation closes only the citation; the next Escape closes the chat', async ({
    page,
  }) => {
    await open(page, `${WIDGET}with-citations`)
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    const pill = panel.getByRole('button', { name: 'Source 1: Deployments guide' })
    await pill.click()
    const card = page.getByRole('dialog', { name: 'Source 1: Deployments guide' })
    await expect(card).toBeVisible()
    await pill.focus()
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    await expect(panel).toBeVisible()
    await pill.focus()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(page.getByRole('button', { name: /^Chat/ })).toBeFocused()
  })

  test('Escape on a peeking citation (tabbed onto) closes only the citation', async ({ page }) => {
    await open(page, `${WIDGET}with-citations`)
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    await panel.getByRole('log').focus()
    await page.keyboard.press('Tab')
    await expect(panel.getByRole('button', { name: 'Source 1: Deployments guide' })).toBeFocused()
    const card = page.getByRole('dialog', { name: 'Source 1: Deployments guide' })
    await expect(card).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    await expect(panel).toBeVisible()
  })

  test('controlled: the app opens it and the composer gets focus; the app closes it and focus goes to the launcher', async ({
    page,
  }) => {
    await open(page, `${WIDGET}controlled`)
    const panel = page.getByRole('dialog', { name: 'Chat with Coreloom' })
    await page.getByRole('button', { name: 'Ask AI' }).click()
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('textbox', { name: 'Message' })).toBeFocused()
    await page.keyboard.press('Control+/')
    await expect(panel).toBeHidden()
    await expect(page.getByRole('button', { name: /^Chat/ })).toBeFocused()
    // Closed by the app while focus is elsewhere: focus stays where it is.
    await page.keyboard.press('Control+/')
    await expect(panel.getByRole('textbox', { name: 'Message' })).toBeFocused()
    const ask = page.getByRole('button', { name: 'Ask AI' })
    await ask.focus()
    await page.keyboard.press('Control+/')
    await expect(panel).toBeHidden()
    await expect(ask).toBeFocused()
  })

  test("on a phone the page behind the sheet doesn't scroll while it's open", async ({ page }) => {
    await open(page, `${WIDGET}on-phone`)
    const overflow = () => page.evaluate(() => document.body.style.overflow)
    await expect.poll(overflow).toBe('hidden')
    await page.getByRole('textbox', { name: 'Message' }).focus()
    await page.keyboard.press('Escape')
    await expect.poll(overflow).toBe('')
    await page.getByRole('button', { name: /^Chat/ }).click()
    await expect.poll(overflow).toBe('hidden')
  })
})
