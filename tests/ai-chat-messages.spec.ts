// Behaviour of a chat's messages: inline citations, editing a sent message, and switching between the
// versions of a message. Runs on the built Storybook like the other interaction tests, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Inline citation (Components/AI, Markdown, Blocks/AI/Chat)', () => {
  test('a citation is named after its source; hovering it shows the source with a link', async ({
    page,
  }) => {
    await open(page, 'components-ai-inline-citation--several')
    const cite = page.getByRole('button', { name: 'Source 1: Deployments guide' })
    await expect(cite).toHaveText('1')
    await cite.hover()
    const card = page.getByRole('dialog', { name: 'Source 1: Deployments guide' })
    await expect(card).toBeVisible()
    await expect(card).toContainText('coreloom.dev')
    await expect(card.getByRole('link', { name: 'Open the source' })).toHaveAttribute(
      'href',
      'https://coreloom.dev/docs/deployments',
    )
    // Peeking leaves focus alone; moving away closes it.
    await page.mouse.move(0, 0)
    await expect(card).toBeHidden()
  })

  test('tabbing onto a citation peeks; Enter moves into the card and Escape comes back', async ({
    page,
  }) => {
    await open(page, 'components-ai-inline-citation--several')
    await page.locator('#storybook-root').click({ position: { x: 1, y: 1 } })
    await page.keyboard.press('Tab')
    const first = page.getByRole('button', { name: 'Source 1: Deployments guide' })
    await expect(first).toBeFocused()
    const card = page.getByRole('dialog', { name: 'Source 1: Deployments guide' })
    await expect(card).toBeVisible()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    // The next citation takes over.
    await page.keyboard.press('Tab')
    await expect(card).toBeHidden()
    await expect(
      page.getByRole('dialog', { name: 'Source 2: Changelog: Workspace.handle' }),
    ).toBeVisible()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Enter')
    await expect(card.getByRole('link', { name: 'Open the source' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    await expect(first).toBeFocused()
  })

  test('a click pins the card open; a document source names its file and has no link', async ({
    page,
  }) => {
    await open(page, 'components-ai-inline-citation--document')
    const cite = page.getByRole('button', { name: 'Source 1: Incident 42 — postmortem' })
    await cite.click()
    const card = page.getByRole('dialog', { name: 'Source 1: Incident 42 — postmortem' })
    await expect(card).toContainText('incident-42.pdf')
    await expect(card.getByRole('link')).toHaveCount(0)
    await page.mouse.move(0, 0)
    await page.waitForTimeout(400)
    await expect(card).toBeVisible()
    await cite.click()
    await expect(card).toBeHidden()
  })

  test('markdown turns [n] into citations, but not in code, links or without a source', async ({
    page,
  }) => {
    await open(page, 'components-ai-markdown--with-sources')
    const root = page.locator('[data-slot=markdown]')
    // [1], [1][2] and the [3] after the link: four citations.
    await expect(root.getByRole('button', { name: /^Source \d/ })).toHaveCount(4)
    await expect(root.getByRole('button', { name: 'Source 3: Runbook — rollbacks' })).toBeVisible()
    await expect(root.locator('code')).toHaveText('deployments[1]')
    await expect(root.getByRole('link', { name: 'CLI reference' })).toBeVisible()
    await expect(root).toContainText('A footnote like [4] without a source')
  })

  test('chat: citations in the answer match the numbered sources under it', async ({ page }) => {
    await open(page, 'blocks-ai-chat--citations')
    const answer = page.getByRole('article', { name: 'Assistant' })
    await expect(
      answer
        .locator('[data-slot=markdown]')
        .getByRole('button', { name: 'Source 2: Retention of builds' }),
    ).toBeVisible()
    await expect(
      answer
        .locator('[data-slot=chat-sources]')
        .getByRole('link', { name: 'Source 2: Retention of builds' }),
    ).toHaveAttribute('href', 'https://coreloom.dev/docs/retention')
    await answer.getByRole('button', { name: 'Source 3: Incident 42 — postmortem' }).click()
    await expect(
      page.getByRole('dialog', { name: 'Source 3: Incident 42 — postmortem' }),
    ).toContainText('incident-42.pdf')
  })

  test('chat: while streaming, a half-written marker stays text', async ({ page }) => {
    await open(page, 'blocks-ai-chat--citations-while-streaming')
    const md = page.locator('[data-slot=markdown]')
    await expect(md.getByRole('button', { name: 'Source 1: Deployments guide' })).toBeVisible()
    await expect(md.getByRole('button', { name: /Source 2/ })).toHaveCount(0)
    await expect(md).toContainText('pruned [2')
  })
})

test.describe('Blocks/AI/Chat · editing and versions', () => {
  const story = 'blocks-ai-chat--edit-and-branches'

  test('Edit turns the message into a box; Escape cancels and focus returns to Edit', async ({
    page,
  }) => {
    await open(page, story)
    const mine = page.getByRole('article', { name: 'You' })
    await mine.hover()
    const edit = mine.getByRole('button', { name: 'Edit message' })
    await edit.click()
    const box = mine.getByRole('textbox', { name: 'Your message' })
    await expect(box).toBeFocused()
    await expect(box).toHaveValue('How do I roll back coreloom-api?')
    await expect(box).toHaveAccessibleDescription(/Escape to cancel/)
    await box.fill('Something else entirely')
    await page.keyboard.press('Escape')
    await expect(box).toHaveCount(0)
    await expect(mine).toContainText('How do I roll back coreloom-api?')
    await expect(edit).toBeFocused()
  })

  test('saving an edit sends the new text, keeps the old one as version 1, and answers again', async ({
    page,
  }) => {
    await open(page, story)
    const mine = page.getByRole('article', { name: 'You' })
    await mine.hover()
    await mine.getByRole('button', { name: 'Edit message' }).click()
    const box = mine.getByRole('textbox', { name: 'Your message' })
    await box.fill('Can I undo a deploy from the dashboard?')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(mine).toContainText('Can I undo a deploy from the dashboard?')
    // Edit is hidden while the answer comes: focus lands on the edited message, not on the page.
    await expect(mine).toBeFocused()
    await expect(mine.getByRole('group', { name: 'Versions' })).toContainText('2 / 2')
    await expect(page.getByRole('article', { name: 'Assistant' })).toContainText(
      'check the last green deployment',
    )
    // Back to the first wording, and its answers.
    await mine.getByRole('button', { name: 'Previous version' }).click()
    await expect(mine).toContainText('How do I roll back coreloom-api?')
    await expect(page.getByRole('article', { name: 'Assistant' })).toContainText(
      'Promote to production',
    )
  })

  test("Save and Cancel buttons work too; an empty message can't be saved", async ({ page }) => {
    await open(page, story)
    const mine = page.getByRole('article', { name: 'You' })
    await mine.hover()
    await mine.getByRole('button', { name: 'Edit message' }).click()
    const box = mine.getByRole('textbox', { name: 'Your message' })
    await box.fill('   ')
    await expect(mine.getByRole('button', { name: 'Save' })).toBeDisabled()
    await mine.getByRole('button', { name: 'Cancel' }).click()
    await expect(box).toHaveCount(0)
    await mine.hover()
    await mine.getByRole('button', { name: 'Edit message' }).click()
    await box.fill('Roll back coreloom-api, but keep the logs')
    await mine.getByRole('button', { name: 'Save' }).click()
    await expect(mine).toContainText('Roll back coreloom-api, but keep the logs')
  })

  test('the version arrows switch the answer, announce it once, and keep focus on the arrow', async ({
    page,
  }) => {
    await open(page, story)
    const answer = page.getByRole('article', { name: 'Assistant' })
    const versions = answer.getByRole('group', { name: 'Versions' })
    const announcer = page.locator('[data-slot=chat-announcer]')
    await expect(versions).toContainText('Version 2 of 2')
    // One live region for the chat, outside the log; the pickers have none of their own.
    await expect(page.locator('[data-slot=chat-messages] [aria-live]')).toHaveCount(0)
    await expect(announcer).toHaveAttribute('aria-live', 'polite')
    await expect(announcer).toHaveText('')
    await expect(versions.getByRole('button', { name: 'Next version' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    const previous = versions.getByRole('button', { name: 'Previous version' })
    await previous.focus()
    await page.keyboard.press('Enter')
    await expect(answer).toContainText('coreloom rollback coreloom-api --to dpl_5t3q')
    await expect(announcer).toHaveText(/^Version 1 of 2/)
    // The answer is another message (another id): the arrow is a new button, and it has the focus.
    await expect(previous).toBeFocused()
    await expect(previous).toHaveAttribute('aria-disabled', 'true')
    // At the first version, Previous does nothing.
    await page.keyboard.press('Enter')
    await expect(versions).toContainText('Version 1 of 2')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(announcer).toHaveText(/^Version 2 of 2/)
    await expect(versions.getByRole('button', { name: 'Next version' })).toBeFocused()

    // Regenerate adds a third version and shows it.
    await page.getByRole('button', { name: 'Regenerate' }).click()
    await expect(versions).toContainText('Version 3 of 3')
    await expect(answer).toContainText('--pin')
  })

  test('an open edit belongs to its message: switching an earlier version drops it', async ({
    page,
  }) => {
    await open(page, story)
    const prompt = page.getByRole('textbox', { name: 'Message' })
    await prompt.fill('And what about the logs?')
    await prompt.press('Enter')
    const mine = page.getByRole('article', { name: 'You' })
    await expect(mine).toHaveCount(2)
    await expect(page.getByRole('article', { name: 'Assistant' })).toHaveCount(2)
    const second = mine.nth(1)
    await second.hover()
    await second.getByRole('button', { name: 'Edit message' }).click()
    await second.getByRole('textbox', { name: 'Your message' }).fill('A draft for the other branch')
    // The first answer's other version has no follow-up question: the edit box must not move onto anything.
    await page
      .getByRole('article', { name: 'Assistant' })
      .first()
      .getByRole('button', { name: 'Previous version' })
      .click()
    await expect(mine).toHaveCount(1)
    await expect(page.getByRole('textbox', { name: 'Your message' })).toHaveCount(0)
    await page
      .getByRole('article', { name: 'Assistant' })
      .first()
      .getByRole('button', { name: 'Next version' })
      .click()
    await expect(mine).toHaveCount(2)
    await expect(mine.nth(1)).toContainText('And what about the logs?')
    await expect(page.getByRole('textbox', { name: 'Your message' })).toHaveCount(0)
  })

  test('in French, the versions read in French', async ({ page }) => {
    await open(page, story, 'fr')
    const versions = page
      .getByRole('article', { name: 'Assistant' })
      .getByRole('group', { name: 'Versions' })
    await expect(versions).toContainText('Version 2 sur 2')
    await versions.getByRole('button', { name: 'Version précédente' }).click()
    await expect(page.locator('[data-slot=chat-announcer]')).toHaveText(/^Version 1 sur 2/)
  })
})

test.describe('Markdown · footnotes, code and links', () => {
  test('footnotes are labelled in a paragraph, translated, and jump in the page', async ({
    page,
  }) => {
    await open(page, 'components-ai-markdown--footnotes-and-long-code', 'fr')
    const md = page.locator('[data-slot=markdown]')
    await expect(md.getByRole('heading')).toHaveCount(0)
    await expect(md.locator('p', { hasText: /^Notes$/ })).toHaveCount(1)
    const back = md.getByRole('link', { name: 'Retour à la référence 1' })
    await expect(back).not.toHaveAttribute('target', /.*/)
    const ref = md.locator('[data-footnote-ref]').first()
    await expect(ref).not.toHaveAttribute('target', /.*/)
    await ref.click()
    expect(page.url()).toContain('#')
  })

  test('only a code block that overflows takes focus', async ({ page }) => {
    await open(page, 'components-ai-markdown--footnotes-and-long-code')
    const blocks = page.locator('[data-slot=markdown-code] pre')
    await expect(blocks).toHaveCount(2)
    await expect(blocks.nth(0)).toHaveAttribute('tabindex', '0')
    await expect(blocks.nth(1)).not.toHaveAttribute('tabindex', /.*/)
    await open(page, 'components-ai-markdown--default')
    await expect(page.locator('[data-slot=markdown-code] pre[tabindex]')).toHaveCount(0)
  })

  test('a source with an unsafe address shows no link', async ({ page }) => {
    await open(page, 'components-ai-inline-citation--unsafe-address')
    await page.getByRole('button', { name: 'Source 1: Suspicious source' }).click()
    const card = page.getByRole('dialog', { name: 'Source 1: Suspicious source' })
    await expect(card).toBeVisible()
    await expect(card.getByRole('link')).toHaveCount(0)
  })

  test('escaped markers, indexes and model-written definitions never become citations or links', async ({
    page,
  }) => {
    await open(page, 'components-ai-markdown--with-sources')
    const md = page.locator('[data-slot=markdown]')
    await expect(md.getByRole('button', { name: /^Source \d/ })).toHaveCount(4)
    await expect(md).toContainText('an escaped [2] and an index like x[2]')
    await expect(md.locator('a[href*="evil.example"]')).toHaveCount(0)
  })
})
