// Geometry people notice: nothing cut by its container, initials whole in a stack of avatars,
// canvas text big enough to read. Runs on the built Storybook, in the dark theme.
import { expect, type Locator, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

/** The element's box on the page, from the layout (works for SVG groups in every engine). */
const rect = (target: Locator) =>
  target.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width }
  })

test.describe('sequence diagram', () => {
  test('shows its last message whole, inside the diagram’s box', async ({ page }) => {
    await open(page, 'components-diagrams-uml-diagram--sequence')
    const region = page.getByRole('region', { name: 'Sequence diagram' })
    await expect(region).toBeVisible()
    const last = region.locator('svg g[data-id]').filter({ hasText: 'Receipt by e-mail' }).last()
    await expect(last).toBeAttached()
    const box = await rect(region)
    const message = await rect(last)
    expect(message.top).toBeGreaterThanOrEqual(box.top - 1)
    expect(message.bottom).toBeLessThanOrEqual(box.bottom + 1)
    expect(message.left).toBeGreaterThanOrEqual(box.left - 1)
    expect(message.right).toBeLessThanOrEqual(box.right + 1)
  })
})

test.describe('calendar heatmap', () => {
  test('shows a year from its first week, not cut on the left', async ({ page }) => {
    await open(page, 'components-charts-heatmap--calendar')
    const grid = page.getByRole('grid', { name: 'Deploys per day, last year' })
    await expect(grid).toBeVisible()
    // The grid's parent is the box it scrolls in.
    const box = await rect(grid.locator('xpath=..'))
    const first = await rect(grid.getByRole('gridcell').first())
    expect(first.left).toBeGreaterThanOrEqual(box.left - 1)
    expect(first.right).toBeLessThanOrEqual(box.right + 1)
  })
})

test.describe('avatar group', () => {
  test('stacked avatars overlap by a third of their width at most', async ({ page }) => {
    await open(page, 'components-data-display--badges-and-avatars')
    const avatars = page.locator('[data-slot=avatar-group] > [data-slot=avatar]')
    await expect(avatars).toHaveCount(2)
    const a = await rect(avatars.nth(0))
    const b = await rect(avatars.nth(1))
    expect(a.right - b.left).toBeLessThanOrEqual(a.width / 3 + 1)
  })
})

test.describe('node editor', () => {
  test('opens with node names at 11px or more', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    const node = page
      .getByRole('application', { name: 'Workflow' })
      .getByRole('group', { name: /^New signup(,|$)/ })
    await expect(node).toBeVisible()
    const title = node.getByText('New signup', { exact: true }).first()
    // The font size as drawn: the CSS size times the canvas zoom.
    const drawn = () =>
      title.evaluate((el) => {
        const zoom = el.getBoundingClientRect().height / (el as HTMLElement).offsetHeight
        return parseFloat(getComputedStyle(el).fontSize) * zoom
      })
    await expect.poll(drawn).toBeGreaterThanOrEqual(10.9)
    // The start of the workflow is in view.
    await expect(node).toBeInViewport({ ratio: 1 })
  })
})
