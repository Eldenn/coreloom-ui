// Blocks at phone width: no block makes the page scroll sideways (what is too wide scrolls inside
// its own card), the layouts that need two columns fall back to one, and a row removed from a list
// leaves focus on that list. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory, stories } from './stories'

/** A common phone (iPhone 15 / Pixel 8 class) in CSS pixels, as in visual.spec.ts. */
const PHONE = { width: 390, height: 844 }

const blocks = stories().filter((story) => story.title.startsWith('Blocks/'))

test.describe('Blocks at phone width', () => {
  for (const story of blocks) {
    test(`no sideways scroll · ${story.title} · ${story.name}`, async ({ page }) => {
      await page.setViewportSize(PHONE)
      await openStory(page, story.id, 'dark')
      const size = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }))
      expect(
        size.content,
        `The page is ${String(size.content)} px wide in a ${String(size.viewport)} px viewport.`,
      ).toBeLessThanOrEqual(size.viewport)
    })
  }

  test('code review shows unified diffs, without the layout choice', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await openStory(page, 'blocks-developer-code-review--split', 'dark')
    const diff = page.locator('[data-slot="diff-viewer"]').first()
    await expect(diff).toHaveAttribute('data-view', 'unified')
    await expect(page.getByRole('radio', { name: 'Split' })).toHaveCount(0)
  })

  test('code review keeps the split layout and its choice on a wide screen', async ({ page }) => {
    await openStory(page, 'blocks-developer-code-review--split', 'dark')
    await expect(page.getByRole('radio', { name: 'Split' })).toBeChecked()
    await expect(page.locator('[data-slot="diff-viewer"]').first()).toHaveAttribute(
      'data-view',
      'split',
    )
  })

  test('the product page keeps a full-height Add to cart button', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await openStory(page, 'blocks-shop--product-page', 'dark')
    const box = await page.getByRole('button', { name: 'Add to cart' }).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(40)
  })

  test('a delivery row keeps its event name readable', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await openStory(page, 'blocks-developer-settings--webhooks-list', 'dark')
    const trigger = page
      .locator('[data-slot="webhook-delivery"]')
      .first()
      .getByRole('button', { expanded: false })
      .first()
    const box = await trigger.boundingBox()
    // The status badge alone is 56 px: the name needs room beside it.
    expect(box?.width).toBeGreaterThanOrEqual(190)
  })
})

test.describe('Focus after a row is removed', () => {
  const confirm = (page: Page, name: string) =>
    page.getByRole('alertdialog').getByRole('button', { name, exact: true }).click()

  test('removing a member moves focus to the list of members', async ({ page }) => {
    await openStory(page, 'blocks-workspace--team', 'dark')
    await page.getByRole('button', { name: 'Remove Ada Lovelace', exact: true }).click()
    await confirm(page, 'Remove')
    await expect(page.getByText('ada@coreloom.dev')).toHaveCount(0)
    await expect(page.getByRole('list', { name: 'Members', exact: true })).toBeFocused()
  })

  test('revoking the last invite moves focus to the list of members', async ({ page }) => {
    await openStory(page, 'blocks-workspace--team', 'dark')
    await page.getByRole('button', { name: 'Revoke the invite to linus@acme.dev' }).click()
    await expect(page.getByText('linus@acme.dev')).toHaveCount(0)
    await expect(page.getByRole('list', { name: 'Members', exact: true })).toBeFocused()
  })

  test('deleting an endpoint moves focus to the list of endpoints', async ({ page }) => {
    await openStory(page, 'blocks-developer-settings--webhooks-list', 'dark')
    await page.getByRole('button', { name: /^Delete https:\/\/billing\./ }).click()
    await confirm(page, 'Delete endpoint')
    await expect(page.getByRole('button', { name: /^Delete https:\/\/billing\./ })).toHaveCount(0)
    await expect(page.getByRole('list', { name: 'Webhooks', exact: true })).toBeFocused()
  })
})
