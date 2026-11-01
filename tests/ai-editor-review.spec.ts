// Review changes: an AI rewrite shown as changes in the editor's text, stepped through and accepted
// or rejected one by one (or all at once) from the bar under the text. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

// The fake model in the With AI story thinks for 1.5 s, then writes a word every 45 ms.
const SUGGESTION_TIMEOUT = 15_000
const EDITOR = 'components-forms-rich-text-editor--'

/** Opens the review story: "Fix spelling and grammar" on the whole draft, then Review changes. */
async function openReview(page: Page, locale: 'en' | 'fr' = 'en') {
  await openStory(
    page,
    `${EDITOR}review-changes${locale === 'fr' ? '-french' : ''}`,
    'dark',
    locale,
  )
  const editor = page.getByRole('textbox', { name: locale === 'fr' ? 'Annonce' : 'Announcement' })
  const bar = page.getByRole('group', {
    name: locale === 'fr' ? 'Modifications suggérées' : 'Suggested changes',
  })
  await expect(bar).toBeVisible()
  return { editor, bar }
}

const first = (page: Page) =>
  page.getByRole('textbox', { name: 'Announcement' }).locator('p').first()

test.describe('editor review', () => {
  test('the changes show in the text, the value waits, and focus lands on the first one', async ({
    page,
  }) => {
    const { editor, bar } = await openReview(page)
    // The panel closed onto the text, with the caret on the first change.
    await expect(page.getByRole('dialog', { name: 'AI assistant' })).toBeHidden()
    await expect(editor).toBeFocused()
    await expect(page.getByRole('status').filter({ hasText: 'suggested changes' })).toHaveText(
      '4 suggested changes. Accept or reject each one below the text.',
    )
    await expect(bar).toContainText('Change 1 of 4')
    await expect(bar).toContainText('Replace “make” with “makes”')
    // Old words struck through (<del>), new ones underlined (<ins>); the document itself is unchanged.
    await expect(editor.locator('del')).toHaveText(['make', 'fix', 'was', 'Thanks'])
    await expect(editor.locator('ins')).toHaveText(['makes', 'fixes', 'were', 'Thank you'])
    await expect(page.getByTestId('review-value')).toHaveText(
      'The value stays as it is until you accept a change.',
    )
  })

  test('Accept and Reject act on the current change and move to the next', async ({ page }) => {
    const { editor, bar } = await openReview(page)
    const status = page.getByRole('status').filter({ hasText: /suggested|Change/ })
    // Tab leaves the text for the bar: Previous, Next, then Reject and Accept.
    await page.keyboard.press('Tab')
    await expect(bar.getByRole('button', { name: 'Previous change' })).toBeFocused()

    const accept = bar.getByRole('button', { name: 'Accept', exact: true })
    await accept.click()
    await expect(status).toHaveText('Change accepted. 3 left.')
    await expect(first(page)).toContainText('our new release makes the build faster')
    await expect(bar).toContainText('Change 1 of 3')
    await expect(bar).toContainText('Replace “fix” with “fixes”')
    // Focus stays on Accept, ready for the next one.
    await expect(accept).toBeFocused()

    await bar.getByRole('button', { name: 'Reject', exact: true }).click()
    await expect(status).toHaveText('Change rejected. 2 left.')
    await expect(first(page)).toContainText('it also fix a lot')
    await expect(editor.locator('del')).toHaveText(['was', 'Thanks'])
    await expect(page.getByTestId('review-value')).toHaveText(
      'The value now has the changes you accepted.',
    )

    // Next and Previous wrap around.
    await bar.getByRole('button', { name: 'Next change' }).click()
    await expect(bar).toContainText('Change 2 of 2')
    await bar.getByRole('button', { name: 'Next change' }).click()
    await expect(bar).toContainText('Change 1 of 2')
    await bar.getByRole('button', { name: 'Previous change' }).click()
    await expect(bar).toContainText('Replace “Thanks” with “Thank you”')
  })

  test('clicking a change in the text makes it the current one', async ({ page }) => {
    const { editor, bar } = await openReview(page)
    await editor.locator('del', { hasText: 'was' }).click()
    await expect(bar).toContainText('Change 3 of 4')
    await expect(bar).toContainText('Replace “was” with “were”')
  })

  test('Accept all applies every change in one undo step; focus goes back to the text', async ({
    page,
  }) => {
    const { editor, bar } = await openReview(page)
    await bar.getByRole('button', { name: 'Accept all' }).click()
    await expect(bar).toBeHidden()
    await expect(editor).toBeFocused()
    await expect(page.getByRole('status').filter({ hasText: 'All changes' })).toHaveText(
      'All changes accepted.',
    )
    await expect(editor.locator('del, ins')).toHaveCount(0)
    await expect(first(page)).toHaveText(
      'our new release makes the build faster and it also fixes a lot of small bugs that people were reporting since last month.',
    )
    // Link and strikethrough made the round trip.
    await expect(editor.locator('p').nth(1).locator('a')).toHaveText('the beta')
    await expect(editor.locator('p').nth(1).locator('s')).toHaveText('three')
    await page.keyboard.press('ControlOrMeta+z')
    await expect(first(page)).toContainText('our new release make the build faster')
    await expect(editor.locator('p').nth(1)).toContainText('Thanks to everyone')
  })

  test('Reject all leaves the text as it was', async ({ page }) => {
    const { editor, bar } = await openReview(page)
    await bar.getByRole('button', { name: 'Reject all' }).click()
    await expect(bar).toBeHidden()
    await expect(editor).toBeFocused()
    await expect(editor.locator('del, ins')).toHaveCount(0)
    await expect(first(page)).toContainText('our new release make the build faster')
    await expect(page.getByTestId('review-value')).toHaveText(
      'The value stays as it is until you accept a change.',
    )
  })

  test('editing the text of a change drops that change only', async ({ page }) => {
    const { editor, bar } = await openReview(page)
    // The caret starts on the first change ("make"): typing into it changes its text.
    await page.keyboard.press('ArrowRight')
    await page.keyboard.type('x')
    await expect(bar).toContainText('of 3')
    await expect(editor.locator('del')).toHaveText(['fix', 'was', 'Thanks'])
  })

  test('from the panel, Review changes is the main action for a rewrite, not for a translation', async ({
    page,
  }) => {
    await openStory(page, `${EDITOR}with-ai`, 'dark')
    const editor = page.getByRole('textbox', { name: 'Announcement' })
    await editor.locator('p').first().click({ clickCount: 3 })
    await expect(editor).toBeFocused()
    await page.keyboard.press('ControlOrMeta+j')
    const panel = page.getByRole('dialog', { name: 'AI assistant' })
    await panel.getByRole('button', { name: 'Improve writing' }).click()
    const review = panel.getByRole('button', { name: 'Review changes' })
    await expect(review).toBeFocused({ timeout: SUGGESTION_TIMEOUT })
    await expect(panel.getByRole('button', { name: 'Replace selection' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(panel).toBeHidden()
    const bar = page.getByRole('group', { name: 'Suggested changes' })
    await expect(bar).toBeVisible()
    await expect(editor).toBeFocused()
    // Only the first paragraph was in play.
    await expect(editor.locator('p').nth(1).locator('del, ins')).toHaveCount(0)
    await bar.getByRole('button', { name: 'Accept all' }).click()
    await expect(editor.locator('p').first()).toHaveText(
      'Our new release makes builds faster and fixes the small bugs you reported over the past month.',
    )
    await expect(editor.locator('p').first().locator('strong')).toHaveText('faster')

    // A translation changes every word: Replace stays the main action, and there's no review.
    await editor.locator('p').first().click({ clickCount: 3 })
    await page.keyboard.press('ControlOrMeta+j')
    await panel.getByRole('button', { name: 'Translate' }).click()
    await panel.getByRole('button', { name: /French/ }).click()
    await expect(panel.getByRole('button', { name: 'Replace selection' })).toBeFocused({
      timeout: SUGGESTION_TIMEOUT,
    })
    await expect(panel.getByRole('button', { name: 'Review changes' })).toHaveCount(0)
  })

  test('the bar speaks French', async ({ page }) => {
    const { bar } = await openReview(page, 'fr')
    await expect(bar).toContainText('Modification 1 sur 4')
    await expect(bar).toContainText('Remplacer « make » par « makes »')
    await expect(bar.getByRole('button', { name: 'Tout accepter' })).toBeVisible()
  })
})
