// BackgroundTasks: the trigger's name and count, the order of the rows, dismissing a finished task,
// the keyboard path and the announcement when a task ends. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, story: string) =>
  openStory(page, `blocks-background-tasks--${story}`, 'dark')

test.describe('Background tasks (Blocks/Background tasks)', () => {
  test('lists running, queued, then finished tasks; dismissing keeps focus in the list', async ({
    page,
  }) => {
    await open(page, 'default')
    await expect(page.getByRole('button', { name: 'Background tasks, 3 running' })).toBeVisible()
    const rows = page.locator('[data-slot=background-task]')
    await expect(rows).toHaveCount(5)
    await expect(rows.nth(0)).toContainText('Catalog search')
    await expect(rows.nth(0)).toContainText('Running')
    await expect(rows.nth(1).getByRole('progressbar', { name: 'Skill scans' })).toBeVisible()
    await expect(rows.nth(2)).toContainText('Queued')
    await expect(rows.nth(3)).toContainText('Code map of coreloom-api')
    await expect(rows.nth(3)).toContainText('Done')
    await expect(rows.nth(4)).toContainText('Failed')
    await expect(rows.nth(4)).toContainText('The embedding model could not be downloaded.')
    // Only finished tasks can be dismissed.
    await expect(page.getByRole('button', { name: /^Dismiss/ })).toHaveCount(2)

    await page.getByRole('button', { name: 'Dismiss Skill tags' }).click()
    await expect(rows).toHaveCount(4)
    await expect(page.locator('body')).not.toBeFocused()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Background tasks, 3 running' })).toBeFocused()
  })

  test('opens and closes with the keyboard', async ({ page }) => {
    await open(page, 'launching')
    const trigger = page.getByRole('button', { name: 'Background tasks', exact: true })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Background tasks' })).toBeVisible()
    await expect(page.getByText('No background tasks.')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('opens on launch and announces the end while closed', async ({ page }) => {
    await open(page, 'launching')
    await page.getByRole('button', { name: 'Import a repository' }).click()
    const dialog = page.getByRole('dialog', { name: 'Background tasks' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('[data-slot=background-task]')).toContainText('Running')
    await expect(page.getByRole('button', { name: 'Background tasks, 1 running' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Finish the import' }).click()
    await expect(page.getByRole('status')).toHaveText('Import from GitHub: done.')
    await expect(page.getByRole('button', { name: 'Background tasks', exact: true })).toBeVisible()
  })

  test('the inline list says each status in words', async ({ page }) => {
    await open(page, 'list')
    const failed = page.locator('[data-slot=background-task][data-status=failed]').first()
    await expect(failed).toContainText('Failed')
    await failed.getByRole('button', { name: /^Dismiss/ }).click()
    await expect(page.locator('body')).not.toBeFocused()
  })
})
