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
