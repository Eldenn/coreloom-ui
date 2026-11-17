// Description list, status, banner, truncated text and highlight, tour, image gallery and comment
// thread: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('description list: terms pair with values, empty ones say so', async ({ page }) => {
  await open(page, 'components-data-display-description-list--default', 'fr')
  const list = page.locator('dl[data-slot=description-list]')
  await expect(list.locator('dt')).toHaveCount(5)
  await expect(list.locator('dd').last()).toHaveText('Non renseigné')
  await expect(list.locator('dd').nth(1).getByRole('button')).toBeVisible()
})

test('banner: dismiss removes it', async ({ page }) => {
  await open(page, 'components-feedback-banner--default')
  const banner = page.locator('[data-slot=banner]').filter({ hasText: 'Maintenance' })
  await expect(banner).toBeVisible()
  await banner.getByRole('button', { name: 'Dismiss' }).click()
  await expect(banner).toHaveCount(0)
  await expect(page.getByText('The maintenance banner was dismissed.')).toBeVisible()
})

test('truncated text: Show more only when cut; highlight marks accent-insensitive matches', async ({
  page,
}) => {
  await open(page, 'components-data-display-truncated-text--default')
  const more = page.getByRole('button', { name: 'Show more' })
  await expect(more).toHaveCount(1)
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await more.click()
  await expect(page.getByRole('button', { name: 'Show less' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )

  await open(page, 'components-data-display-truncated-text--search')
  await expect(page.locator('mark')).toHaveText(['École', 'Export'])
  await page.getByRole('textbox', { name: 'Search the help center' }).fill('sso slack')
  await expect(page.locator('mark')).toHaveText(['Slack'])
})

test('tour: steps move, spotlight follows, Escape ends it', async ({ page }) => {
  await open(page, 'components-overlays-tour--default')
  const card = page.getByRole('dialog', { name: 'Start a project' })
  await expect(card).toContainText('Step 2 of 4')
  await expect(card.getByText('Start a project', { exact: true })).toBeFocused()
  await card.getByRole('button', { name: 'Next' }).click()
  const search = page.getByRole('dialog', { name: 'Find anything' })
  await expect(search).toContainText('Step 3 of 4')
  await search.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByRole('dialog', { name: 'Start a project' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('[data-slot=tour-spotlight]')).toHaveCount(0)
})

test('image gallery: a thumbnail opens the viewer; arrows go through, Escape closes', async ({
  page,
}) => {
  await open(page, 'components-data-display-image-gallery--default')
  const thumb = page.getByRole('button', { name: 'Open Kitchen' })
  await thumb.click()
  const viewer = page.getByRole('dialog')
  await expect(viewer).toContainText('2 of 6')
  await expect(viewer.getByRole('img', { name: 'Kitchen' })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(viewer).toContainText('3 of 6')
  await expect(viewer.getByRole('img', { name: 'Bedroom' })).toBeVisible()
  await viewer.getByRole('button', { name: 'Previous image' }).click()
  await viewer.getByRole('button', { name: 'Previous image' }).click()
  await expect(viewer).toContainText('1 of 6')
  await viewer.getByRole('button', { name: 'Zoom in' }).click()
  await expect(viewer.getByRole('button', { name: 'Zoom out' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  // The focus lands on the thumbnail of the image last shown.
  await expect(page.getByRole('button', { name: 'Open Living room, morning light' })).toBeFocused()
})

test('comment thread: reply, react, comment', async ({ page }) => {
  await open(page, 'components-data-display-comment-thread--default')
  const thread = page.getByRole('region', { name: 'Comments' })
  await expect(thread.getByRole('article')).toHaveCount(4)
  // A reaction toggles off and on.
  const thumbs = thread.getByRole('button', { name: /^👍 3 reactions, including yours$/ })
  await thumbs.click()
  await expect(thread.getByRole('button', { name: /^👍 2 reactions$/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  // Reply to Sami.
  await thread.getByRole('button', { name: 'Reply to Sami Haddad' }).last().click()
  const box = thread.getByRole('textbox', { name: 'Reply to Sami Haddad' })
  await expect(box).toBeFocused()
  await box.fill('Fixed, thanks.')
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(thread.getByRole('article')).toHaveCount(5)
  await expect(thread.getByText('Fixed, thanks.')).toBeVisible()
  // A new comment at the end.
  const main = thread.getByRole('textbox', { name: 'Write a comment…' })
  await main.fill('Looks good to me')
  await thread.getByRole('button', { name: 'Comment', exact: true }).click()
  await expect(thread.getByRole('article').last()).toContainText('Looks good to me')
})
