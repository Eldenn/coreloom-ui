// Timeline, relative time, tree view, code viewer, diff viewer and JSON viewer: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('timeline: an ordered list of events with their times', async ({ page }) => {
  await open(page, 'components-data-display-timeline--default')
  const list = page.getByRole('list', { name: 'Pull request history' })
  await expect(list.getByRole('listitem')).toHaveCount(5)
  await expect(list.getByRole('listitem').first()).toContainText('opened the pull request')
  await expect(list.locator('time').first()).toHaveText('yesterday')
  await expect(list.locator('time').first()).toHaveAttribute('datetime', /^2026-10-13T/)
})

test('relative time: words in the locale, the full date in the tooltip', async ({ page }) => {
  await open(page, 'components-data-display-relative-time--default', 'fr')
  const times = page.locator('time')
  await expect(times.nth(2)).toHaveText('il y a 5 minutes')
  await expect(times.nth(2)).toHaveAttribute('title', /2026/)
})

test('tree view: arrows move and open, Enter selects, type-ahead jumps', async ({ page }) => {
  await open(page, 'components-data-display-tree-view--default')
  const tree = page.getByRole('tree', { name: 'Files' })
  const item = (name: string) => tree.getByRole('treeitem', { name, exact: true })
  await expect(item('button.tsx 4 KB')).toHaveAttribute('aria-selected', 'true')
  await item('button.tsx 4 KB').focus()
  await page.keyboard.press('ArrowDown')
  await expect(item('card.tsx 2 KB')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Open: src/components/card.tsx')).toBeVisible()
  // Disabled nodes take focus but not the selection.
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Open: src/components/card.tsx')).toBeVisible()
  // Type-ahead, then Right opens the branch and enters it.
  await page.keyboard.press('d')
  const docs = tree.getByRole('treeitem', { name: /^docs/ })
  await expect(docs).toBeFocused()
  await expect(docs).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('ArrowRight')
  await expect(docs).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(item('intro.md 6 KB')).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(docs).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(docs).toHaveAttribute('aria-expanded', 'false')
})

test('tree view: several nodes, Space toggles', async ({ page }) => {
  await open(page, 'components-data-display-tree-view--multiple')
  const tree = page.getByRole('tree', { name: 'Pages to export' })
  await expect(tree).toHaveAttribute('aria-multiselectable', 'true')
  await tree.getByRole('treeitem', { name: 'Your buddy' }).click()
  await expect(page.getByText('3 pages: first-day, tools, buddy')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(page.getByText('2 pages: first-day, tools')).toBeVisible()
})

test('code viewer: highlighted lines are announced, wrap toggles', async ({ page }) => {
  await open(page, 'components-data-display-code-viewer--default')
  const viewer = page.locator('[data-slot=code-viewer]')
  await expect(viewer.locator('[data-highlighted]')).toHaveCount(4)
  await expect(viewer.locator('[data-line="5"]')).toContainText('Highlighted:')
  const wrap = viewer.getByRole('button', { name: 'Wrap lines' })
  await expect(wrap).toHaveAttribute('aria-pressed', 'false')
  await wrap.click()
  await expect(wrap).toHaveAttribute('aria-pressed', 'true')
  await expect(viewer.getByRole('region', { name: 'use-debounced.ts' })).toBeVisible()
})

test('diff viewer: counts, signs read out, folds open', async ({ page }) => {
  await open(page, 'components-data-display-diff-viewer--default')
  const diff = page.locator('[data-slot=diff-viewer]')
  await expect(diff).toContainText('4 lines added')
  await expect(diff).toContainText('3 lines removed')
  await expect(diff.locator('tr[data-change="add"]')).toHaveCount(4)
  await expect(diff.locator('tr[data-change="remove"]').first()).toContainText('Removed')
  const rows = await diff.locator('tbody tr').count()
  await diff
    .getByRole('button', { name: /^Show \d+ unchanged lines?$/ })
    .first()
    .click()
  await expect.poll(() => diff.locator('tbody tr').count()).toBeGreaterThan(rows)

  await open(page, 'components-data-display-diff-viewer--split')
  await expect(page.getByRole('columnheader', { name: 'Before' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'After' })).toBeVisible()
})

test('json viewer: branches fold, expand all, collapse all', async ({ page }) => {
  await open(page, 'components-data-display-json-viewer--collapsed')
  const viewer = page.locator('[data-slot=json-viewer]')
  const data = viewer.getByRole('button', { name: /"data"/ })
  await expect(data).toHaveAttribute('aria-expanded', 'false')
  await expect(data).toContainText('7 keys')
  await data.click()
  await expect(data).toHaveAttribute('aria-expanded', 'true')
  await expect(viewer).toContainText('"invoice": "in_7781"')
  await viewer.getByRole('button', { name: 'Expand all' }).click()
  await expect(viewer).toContainText('"email": "billing@atelier-martin.fr"')
  await viewer.getByRole('button', { name: 'Collapse all' }).click()
  await expect(viewer.getByRole('button', { name: /^\{/ })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await expect(viewer).not.toContainText('"id"')
})
