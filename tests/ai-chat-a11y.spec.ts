// The chat for someone who doesn't use a mouse or doesn't see the screen: where focus lands after a
// conversation is renamed or deleted, what a search says, and what the message log announces.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

test.describe('Blocks/AI/Chat · conversation list', () => {
  const story = 'blocks-ai-chat--with-history'
  const rename = async (page: Page, title: string) => {
    await page.getByRole('button', { name: `Actions for ${title}` }).focus()
    await page.keyboard.press('Enter')
    await page.getByRole('menuitem', { name: 'Rename' }).press('Enter')
    const field = page.getByRole('textbox', { name: 'Conversation title' })
    await expect(field).toBeFocused()
    return field
  }

  test('renaming from the keyboard: Enter saves and focus is back on the conversation', async ({
    page,
  }) => {
    await open(page, story)
    const field = await rename(page, 'Release notes for v0.8')
    await field.fill('Release notes for v0.9')
    await field.press('Enter')
    await expect(field).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Release notes for v0.9', exact: true }),
    ).toBeFocused()
  })

  test('renaming from the keyboard: Escape keeps the title and focus is back on the conversation', async ({
    page,
  }) => {
    await open(page, story)
    const field = await rename(page, 'Build minutes by project')
    await field.fill('Something else')
    await field.press('Escape')
    await expect(field).toHaveCount(0)
    await expect(page.getByText('Something else')).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Build minutes by project', exact: true }),
    ).toBeFocused()
  })

  test('deleting a conversation moves focus to the next one, or to the previous one at the end', async ({
    page,
  }) => {
    await open(page, story)
    const remove = async (title: string) => {
      await page.getByRole('button', { name: `Actions for ${title}` }).focus()
      await page.keyboard.press('Enter')
      await page.getByRole('menuitem', { name: 'Delete' }).press('Enter')
      const dialog = page.getByRole('alertdialog', { name: 'Delete this conversation?' })
      await dialog.getByRole('button', { name: 'Delete' }).click()
      await expect(dialog).toBeHidden()
      await expect(page.getByRole('button', { name: title, exact: true })).toHaveCount(0)
    }
    await remove('Build minutes by project')
    await expect(
      page.getByRole('button', { name: 'Rename the billing workspace', exact: true }),
    ).toBeFocused()
    await remove('Onboarding checklist')
    await expect(
      page.getByRole('button', { name: 'Incident 42 postmortem', exact: true }),
    ).toBeFocused()
  })

  test('a search says how many conversations match, or that none does, in a status', async ({
    page,
  }) => {
    await open(page, story)
    const list = page.getByRole('navigation', { name: 'Conversations' })
    const status = list.getByRole('status')
    await expect(status).toHaveText('')
    const search = list.getByRole('textbox', { name: 'Search conversations' })
    await search.fill('incident')
    await expect(status).toHaveText('1 conversation')
    await search.fill('nothing like this')
    await expect(status).toHaveText('No conversation matches.')
    await expect(status).toBeVisible()
    await search.fill('')
    await expect(status).toHaveText('')
  })

  test('the day groups are named lists, not headings', async ({ page }) => {
    await open(page, story)
    const list = page.getByRole('navigation', { name: 'Conversations' })
    await expect(list.getByRole('heading')).toHaveCount(0)
    await expect(list.getByRole('list', { name: 'Today' })).toBeVisible()
  })
})

test.describe('Blocks/AI/Chat · message log', () => {
  const nested = '[role=status], [role=alert], [aria-live]'

  test('waiting is said by the log itself, with no live region inside it', async ({ page }) => {
    await open(page, 'blocks-ai-chat--waiting')
    const log = page.getByRole('log', { name: 'Conversation' })
    await expect(log).toContainText('Waiting for the answer')
    await expect(log.locator(nested)).toHaveCount(0)
  })

  test('an error is a line of the log, with no alert inside it, and offers Try again', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-chat--error-state')
    const log = page.getByRole('log', { name: 'Conversation' })
    await expect(log).toContainText("The answer couldn't be generated.")
    await expect(log.getByRole('button', { name: 'Try again' })).toBeVisible()
    await expect(log.locator(nested)).toHaveCount(0)
  })
})
