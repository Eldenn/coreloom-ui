// SuggestionList: accept, edit then accept, ignore; focus after each suggestion leaves the list;
// a failed save keeps the suggestion; the edit field's keys. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, story: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, `components-actions-suggestion-list--${story}`, 'dark', locale)

const list = (page: Page) => page.getByRole('list', { name: 'Suggestions' })
const accepted = (page: Page) => page.getByRole('list', { name: 'Accepted rules' })

test.describe('Suggestion list (Components/Actions/Suggestion list)', () => {
  test('shows each suggestion with its label, text, origin and actions', async ({ page }) => {
    await open(page, 'default')
    const items = list(page).getByRole('listitem')
    await expect(items).toHaveCount(3)
    const first = items.first()
    await expect(first).toContainText('Testing')
    await expect(first).toContainText('Write a Playwright spec for every new page')
    await expect(first).toContainText('From your notes on “How do you test?”')
    // Inline Markdown keeps the code span.
    await expect(items.nth(1).locator('code')).toHaveText('any')
    const accept = first.getByRole('button', { name: 'Accept' })
    await expect(accept).toHaveAccessibleDescription(/Write a Playwright spec/)
    await expect(first.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(first.getByRole('button', { name: 'Ignore' })).toBeVisible()
  })

  test('Accept hands the text back, announces it and moves focus to the next one', async ({
    page,
  }) => {
    await open(page, 'interactive')
    await list(page).getByRole('listitem').first().getByRole('button', { name: 'Accept' }).click()
    await expect(accepted(page)).toContainText('Write a Playwright spec for every new page')
    await expect(list(page).getByRole('listitem')).toHaveCount(2)
    await expect(page.getByRole('status')).toHaveText('Suggestion accepted. 2 left.')
    const next = list(page).getByRole('listitem').first()
    await expect(next).toContainText('Never use')
    await expect(next.getByRole('button', { name: 'Accept' })).toBeFocused()
  })

  test('Edit then accept keeps the edited text; Escape cancels and refocuses Edit', async ({
    page,
  }) => {
    await open(page, 'interactive')
    const item = list(page).getByRole('listitem').nth(2)
    await item.getByRole('button', { name: 'Edit' }).click()
    const field = item.getByRole('textbox', { name: 'Suggested text' })
    await expect(field).toBeFocused()
    await expect(field).toHaveValue(/Conventional Commits/)
    await page.keyboard.press('Escape')
    await expect(field).toHaveCount(0)
    await expect(item.getByRole('button', { name: 'Edit' })).toBeFocused()

    await item.getByRole('button', { name: 'Edit' }).click()
    await field.fill('')
    await expect(item.getByRole('button', { name: 'Accept edit' })).toBeDisabled()
    await field.fill('Write commit messages in English.')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(accepted(page)).toContainText('Write commit messages in English.')
    await expect(list(page).getByRole('listitem')).toHaveCount(2)
    // It was the last one: focus goes to the one before it.
    await expect(
      list(page).getByRole('listitem').nth(1).getByRole('button', { name: 'Accept' }),
    ).toBeFocused()
  })

  test('Ignore drops it without accepting; the list says when nothing is left', async ({
    page,
  }) => {
    await open(page, 'interactive')
    for (let left = 2; left >= 0; left--) {
      await list(page).getByRole('listitem').first().getByRole('button', { name: 'Ignore' }).click()
      await expect(page.getByRole('status')).toHaveText(
        left === 0 ? 'Suggestion ignored. None left.' : `Suggestion ignored. ${left} left.`,
      )
    }
    await expect(page.getByText('No suggestions left.')).toBeVisible()
    await expect(page.locator('[data-slot="suggestion-list"]')).toBeFocused()
    await expect(page.getByText('Nothing yet.')).toBeVisible()
  })

  test('a failed save keeps the suggestion and its edit; a second try works', async ({ page }) => {
    await open(page, 'failed-save')
    const item = list(page).getByRole('listitem').nth(1)
    await item.getByRole('button', { name: 'Edit' }).click()
    await item.getByRole('textbox', { name: 'Suggested text' }).fill('Never use `any`.')
    await item.getByRole('button', { name: 'Accept edit' }).click()
    await expect(page.getByRole('status')).toHaveText(
      'That didn’t go through. The suggestion is still here.',
    )
    await expect(list(page).getByRole('listitem')).toHaveCount(3)
    await expect(item.getByRole('textbox', { name: 'Suggested text' })).toHaveValue(
      'Never use `any`.',
    )
    await item.getByRole('button', { name: 'Accept edit' }).click()
    await expect(accepted(page)).toContainText('Never use `any`.')
    await expect(list(page).getByRole('listitem')).toHaveCount(2)
  })

  test('without Edit, and disabled', async ({ page }) => {
    await open(page, 'not-editable')
    await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0)
    await open(page, 'disabled')
    for (const button of await page.getByRole('button').all()) await expect(button).toBeDisabled()
  })

  test('speaks French', async ({ page }) => {
    await open(page, 'french', 'fr')
    const first = page.getByRole('list', { name: 'Suggestions' }).getByRole('listitem').first()
    await expect(first.getByRole('button', { name: 'Accepter' })).toBeVisible()
    await expect(first.getByRole('button', { name: 'Modifier' })).toBeVisible()
    await expect(first.getByRole('button', { name: 'Ignorer' })).toBeVisible()
    await open(page, 'french-empty', 'fr')
    await expect(page.getByText('Plus aucune suggestion.')).toBeVisible()
  })
})
