// CodeReview: going to a file from the tree by keyboard, commenting on a line with the keyboard
// (and focus coming back to the line), replying, resolving, "Viewed", finishing the review, and the
// folded tree on a phone. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) =>
  openStory(page, `blocks-developer-code-review--${id}`, 'dark')
const file = (page: Page, path: string) =>
  page.locator(`[data-slot="code-review-file"][data-path="${path}"]`)

test.describe('Code review (Blocks/Developer/Code review)', () => {
  test('Enter on a file in the tree goes to it and focuses its header', async ({ page }) => {
    await open(page, 'default')
    const item = page.getByRole('treeitem', { name: /price-tag\.tsx/ })
    await item.focus()
    await page.keyboard.press('Enter')
    const header = file(page, 'src/components/price-tag.tsx').getByRole('button', {
      name: /src\/components\/price-tag\.tsx/,
    })
    await expect(header).toBeFocused()
    await expect(header).toHaveAttribute('aria-expanded', 'true')
    await expect(item).toHaveAttribute('aria-selected', 'true')
  })

  test('a line comment is written with the keyboard, then focus returns to the line', async ({
    page,
  }) => {
    await open(page, 'default')
    const format = file(page, 'src/lib/format.ts')
    const action = format.getByRole('button', { name: 'Comment on line 2', exact: true })
    await action.focus()
    await expect(action).toBeVisible()
    await page.keyboard.press('Enter')
    const box = format.getByRole('textbox', { name: 'New comment on line 2' })
    await expect(box).toBeFocused()
    await page.keyboard.type('Cache the formatter.')
    await page.keyboard.press('Control+Enter')
    const thread = format.getByRole('group', { name: 'Comments on line 2 of src/lib/format.ts' })
    await expect(thread).toContainText('Cache the formatter.')
    await expect(box).toHaveCount(0)
    await expect(action).toBeFocused()
    await expect(page.getByRole('treeitem', { name: /format\.ts/ })).toContainText('1')
  })

  test('Escape cancels a draft and focus returns to the line', async ({ page }) => {
    await open(page, 'default')
    const format = file(page, 'src/lib/format.ts')
    const action = format.getByRole('button', { name: 'Comment on removed line 1' })
    await action.click()
    await expect(format.getByRole('textbox', { name: 'New comment on line 1' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(format.getByRole('textbox')).toHaveCount(0)
    await expect(action).toBeFocused()
  })

  test('a reply joins the thread, and resolving folds it and keeps focus', async ({ page }) => {
    await open(page, 'with-threads')
    const thread = page.getByRole('group', { name: 'Comments on line 2 of src/lib/format.ts' })
    await thread.getByRole('textbox', { name: 'Write a comment…' }).fill('Done in the next commit.')
    await thread.getByRole('button', { name: 'Comment', exact: true }).click()
    await expect(thread).toContainText('Done in the next commit.')
    await expect(thread).toContainText('3 comments')

    await thread.getByRole('button', { name: 'Resolve conversation' }).click()
    const unresolve = thread.getByRole('button', { name: 'Unresolve conversation' })
    await expect(unresolve).toBeFocused()
    await expect(thread).toContainText('Resolved')
    await expect(thread.getByText('Done in the next commit.')).toHaveCount(0)
    const show = thread.getByRole('button', { name: 'Show conversation' })
    await expect(show).toHaveAttribute('aria-expanded', 'false')
    await show.click()
    await expect(show).toHaveAttribute('aria-expanded', 'true')
    await expect(thread).toContainText('Done in the next commit.')
  })

  test('a thread on a removed line starts resolved and folded', async ({ page }) => {
    await open(page, 'with-threads')
    const thread = page.getByRole('group', { name: 'Comments on line 1 of src/lib/format.ts' })
    await expect(thread).toContainText('Resolved')
    await expect(thread.getByText('Is anything else still importing')).toHaveCount(0)
  })

  test('Viewed folds the file and counts in the header', async ({ page }) => {
    await open(page, 'default')
    await expect(page.getByText('0 of 4 viewed')).toBeVisible()
    const format = file(page, 'src/lib/format.ts')
    await format.getByRole('checkbox', { name: 'Mark src/lib/format.ts as viewed' }).click()
    await expect(page.getByText('1 of 4 viewed')).toBeVisible()
    const header = format.getByRole('button', { name: /src\/lib\/format\.ts/ })
    await expect(header).toHaveAttribute('aria-expanded', 'false')
    await expect(format.getByRole('table')).toHaveCount(0)
    await header.click()
    await expect(format.getByRole('table')).toBeVisible()
  })

  test('Finish review sends the verdict and the summary, then closes', async ({ page }) => {
    await open(page, 'default')
    const finish = page.getByRole('button', { name: 'Finish review' })
    await finish.click()
    const popover = page.getByRole('dialog')
    await popover.getByText('Approve', { exact: true }).click()
    await expect(popover.getByRole('radio', { name: /^Approve/ })).toBeChecked()
    await popover.getByRole('textbox', { name: 'Summary' }).fill('Looks good.')
    await popover.getByRole('button', { name: 'Submit review' }).click()
    await expect(popover.getByRole('button', { name: 'Submitting…' })).toBeDisabled()
    await expect(page.getByText('Review sent: approve')).toBeVisible()
    await expect(popover).toHaveCount(0)
    await expect(finish).toBeFocused()
  })

  test('split layout puts the comment buttons beside both sides', async ({ page }) => {
    await open(page, 'split')
    const format = file(page, 'src/lib/format.ts')
    await expect(format.getByRole('columnheader', { name: 'Before' })).toBeVisible()
    await expect(format.getByRole('button', { name: 'Comment on removed line 1' })).toHaveCount(1)
    await expect(
      format.getByRole('button', { name: 'Comment on line 1', exact: true }),
    ).toHaveCount(1)
    await page.getByRole('radio', { name: 'Unified' }).check()
    await expect(format.getByRole('columnheader')).toHaveCount(0)
  })

  test('on a phone the tree folds behind Files and closes when a file is chosen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page, 'phone')
    const files = page.getByRole('button', { name: 'Files' })
    await expect(files).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('tree')).toBeHidden()
    await files.click()
    const item = page.getByRole('treeitem', { name: /pricing\.md/ })
    await item.click()
    await expect(page.getByRole('tree')).toBeHidden()
    await expect(
      file(page, 'docs/pricing.md').getByRole('button', { name: /docs\/pricing\.md/ }),
    ).toBeFocused()
  })

  test('an empty review says there is nothing to review', async ({ page }) => {
    await open(page, 'empty')
    await expect(page.getByText('No changes to review.')).toBeVisible()
    await expect(page.getByText('0 files changed')).toBeVisible()
  })
})
