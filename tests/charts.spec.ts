// The chart components outside Recharts: what screen readers get from each one, and the BarList's
// "Show all" button. Runs on the built Storybook like the other interaction tests, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('sparkline', () => {
  test('is an image named by its label plus a summary of the trend', async ({ page }) => {
    await open(page, 'components-charts-sparkline--default')
    await expect(
      page.getByRole('img', {
        name: 'Sign-ups, last 12 weeks. Trend from 42 to 108. Low 42, high 108.',
      }),
    ).toBeVisible()
  })

  test('says when there is no data, and translates the summary', async ({ page }) => {
    await open(page, 'components-charts-sparkline--empty')
    await expect(page.getByRole('img', { name: 'Sign-ups, last 12 weeks. No data' })).toBeVisible()
    await open(page, 'components-charts-sparkline--french', 'fr')
    await expect(
      page.getByRole('img', {
        name: 'Revenu hebdomadaire. Évolution de 1 250,5 à 1 402. Minimum 1 250,5, maximum 1 402.',
      }),
    ).toBeVisible()
  })

  test('draws one per stat card', async ({ page }) => {
    await open(page, 'components-charts-sparkline--in-stat-card')
    await expect(page.getByRole('img', { name: /^Sign-ups\. Trend from 42 to 108/ })).toBeVisible()
    await expect(
      page.getByRole('img', { name: /^p95 latency\. Trend from 240 to 182/ }),
    ).toBeVisible()
  })
})

test.describe('donut chart', () => {
  test('states the total and lists every part with its value and share', async ({ page }) => {
    await open(page, 'components-charts-donut-chart--default')
    await expect(
      page.getByRole('img', {
        name: 'Requests by model, October. Total 86,000. Values by part in the legend.',
      }),
    ).toBeVisible()
    const legend = page.getByRole('list', { name: 'Legend' })
    const items = legend.getByRole('listitem')
    await expect(items).toHaveCount(4)
    await expect(items.nth(0)).toHaveText(/Claude Sonnet\s*41,200\s*47.9%/)
    // Gemini, Llama and Mistral are folded: 5,400 + 2,100 + 900.
    await expect(items.nth(3)).toHaveText(/Other\s*8,400\s*9.8%/)
  })

  test('folds into "Autres" in French', async ({ page }) => {
    await open(page, 'components-charts-donut-chart--french', 'fr')
    await expect(
      page.getByRole('list', { name: 'Légende' }).getByRole('listitem').nth(3),
    ).toHaveText(/Autres/)
  })
})

test.describe('bar list', () => {
  test('shows the top rows, then all of them, and keeps focus on the button', async ({ page }) => {
    await open(page, 'components-charts-bar-list--with-limit')
    const list = page.getByRole('list', { name: 'Top pages by views' })
    await expect(list.getByRole('listitem')).toHaveCount(5)
    // Largest first, each label a link.
    await expect(list.getByRole('listitem').first()).toHaveText(/^\/\s*31,420$/)
    await expect(list.getByRole('link', { name: '/pricing' })).toHaveAttribute('href', '#pricing')

    const more = page.getByRole('button', { name: 'Show all 8' })
    await expect(more).toHaveAttribute('aria-expanded', 'false')
    await more.focus()
    await page.keyboard.press('Enter')
    await expect(list.getByRole('listitem')).toHaveCount(8)
    const less = page.getByRole('button', { name: 'Show less' })
    await expect(less).toHaveAttribute('aria-expanded', 'true')
    await expect(less).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(list.getByRole('listitem')).toHaveCount(5)
  })
})

test.describe('gauge', () => {
  test('is a meter with its value, range and status in words', async ({ page }) => {
    await open(page, 'components-charts-gauge--thresholds')
    const seats = page.getByRole('meter', { name: 'Seats used' })
    await expect(seats).toHaveAttribute('aria-valuenow', '86')
    await expect(seats).toHaveAttribute('aria-valuemax', '100')
    await expect(seats).toHaveAttribute('aria-valuetext', '86 % of 100, Warning')
    await expect(seats).toContainText('Warning')
    await expect(page.getByRole('meter', { name: 'API quota' })).toContainText('Critical')
    await expect(page.getByRole('meter', { name: 'Storage used' })).toContainText('Normal')
  })

  test('flips the zones when higher is better', async ({ page }) => {
    await open(page, 'components-charts-gauge--higher-is-better')
    const uptime = page.getByRole('meter', { name: 'Uptime, 30 days' })
    await expect(uptime).toHaveAttribute('aria-valuetext', '99.32\u202f% of 100.00, Warning')
  })

  test('has no status without thresholds', async ({ page }) => {
    await open(page, 'components-charts-gauge--default')
    await expect(page.getByRole('meter', { name: 'Storage used' })).toHaveAttribute(
      'aria-valuetext',
      '64 % of 100',
    )
  })
})

test.describe('heatmap', () => {
  test('is one tab stop; arrows move between named cells and the readout follows', async ({
    page,
  }) => {
    await open(page, 'components-charts-heatmap--default')
    const grid = page.getByRole('grid', { name: 'Deploys by weekday and hour' })
    await expect(grid.getByRole('gridcell')).toHaveCount(7 * 24)
    await page.keyboard.press('Tab')
    const first = grid.getByRole('gridcell', { name: 'Mon, 00: 0' })
    await expect(first).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowRight')
    await expect(grid.getByRole('gridcell', { name: /^Tue, 01: / })).toBeFocused()
    await page.keyboard.press('End')
    await expect(grid.getByRole('gridcell', { name: /^Tue, 23: / })).toBeFocused()
    await page.keyboard.press('Control+Home')
    await expect(first).toBeFocused()
    await expect(page.getByText('Mon, 00: 0', { exact: true })).toBeVisible()
    // Only one cell is in the tab order.
    await expect(grid.locator('[tabindex="0"]')).toHaveCount(1)
  })

  test('names gaps "No data"', async ({ page }) => {
    await open(page, 'components-charts-heatmap--matrix')
    await expect(page.getByRole('gridcell', { name: 'search, Oct 11: No data' })).toHaveCount(1)
  })

  test('calendar cells say the full date and the value, in the locale', async ({ page }) => {
    await open(page, 'components-charts-heatmap--calendar')
    const grid = page.getByRole('grid', { name: 'Deploys per day, last year' })
    await expect(grid.getByRole('row')).toHaveCount(8)
    await expect(
      grid.getByRole('gridcell', { name: /^Saturday, October 31, 2026: \d+ deploys?$/ }),
    ).toHaveCount(1)
    await open(page, 'components-charts-heatmap--french', 'fr')
    await expect(
      page.getByRole('gridcell', { name: /^samedi 31 octobre 2026 : \d+$/ }),
    ).toHaveCount(1)
  })
})

test.describe('funnel chart', () => {
  test('lists the steps in order with counts, shares and what dropped', async ({ page }) => {
    await open(page, 'components-charts-funnel-chart--default')
    const steps = page
      .getByRole('list', { name: 'Sign-up funnel, October 2026' })
      .getByRole('listitem')
    await expect(steps).toHaveCount(5)
    await expect(steps.nth(0)).toContainText('Visited the pricing page')
    await expect(steps.nth(0)).toContainText('12,480')
    await expect(steps.nth(1)).toContainText('33.8% continue (8,268 dropped)')
    await expect(steps.nth(1)).toContainText('of the first step: 33.8%')
    await expect(steps.nth(4)).toContainText('of the first step: 3.9%')
  })
})

test.describe('trend chart', () => {
  test('stacked, percent and combo charts draw', async ({ page }) => {
    for (const id of ['stacked-bars', 'percent-area', 'combo']) {
      await open(page, `blocks-dashboard--${id}`)
      await expect(page.locator('.recharts-surface').first()).toBeVisible()
    }
    // The combo has a second axis on the right with the error rate's format.
    await expect(
      page.locator('.recharts-cartesian-axis-tick-value').filter({ hasText: '1.8\u202f%' }),
    ).toHaveCount(1)
  })
})
